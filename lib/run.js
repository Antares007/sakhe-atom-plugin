const most = require('most')
const {hold} = require('@most/hold')
const dispose = require('most/lib/disposable/dispose')
const debug = require('debug')('run')
const debugSink = (key) => ($) =>
  $.tap((e) => { debug(key, e) })
   .flatMapError((err) => { debug(key, err); return most.throwError(err) })
   .flatMapEnd(() => { debug(key, 'end'); return most.empty() })

class RunSource {
  constructor (main, drivers) {
    this.main = main
    this.drivers = drivers
  }

  run (sink, scheduler) {
    const drivers = this.drivers
    const main = this.main
    const end$ = most.never().thru(hold)
    var disposed = false
    var disposable = dispose.create(() => { disposed = true })
    const task = {
      run (t) {
        const sources = {}
        const sink$s = {}
        for (let key in drivers) {
          const sink$ = sink$s[key] = most.never().multicast()
          sources[key] = drivers[key].call({
            scheduler,
            dispose: (disposeFn) => {
              if (disposed) throw new Error('driver already disposed!!!')
              disposable = dispose.all([
                disposable,
                dispose.create(disposeFn)
              ])
            }
          }, sink$.until(end$))
        }

        const mainSinks = main(sources)

        const outputSinks = Object.keys(mainSinks).reduce((sinks, key) => {
          if (sink$s[key]) return sinks
          sinks[key] = mainSinks[key].thru(debugSink(key))
          return sinks
        }, {})

        sink.event(t, outputSinks)

        for (let key in mainSinks) {
          if (!sink$s[key]) continue
          mainSinks[key]
            .until(end$)
            .thru(debugSink(key))
            .source.run(sink$s[key].source, scheduler)
        }
      },
      error: sink.error.bind(sink),
      dispose () {
        end$.source.event(scheduler.now())
        return disposable.dispose()
      }
    }
    return scheduler.asap(task)
  }
}

module.exports = (main, drivers) => (sources) => ({
  sinks$: new most.Stream(
    new RunSource(
      (driversSources) => main(Object.assign({}, sources, driversSources)),
      drivers
    )
  ).multicast()
})
