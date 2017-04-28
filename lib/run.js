const most = require('most')
const debug = require('debug')
var i = 0
class RunSource {
  constructor (main, drivers) {
    this.main = main
    this.drivers = drivers
  }

  run (sink, scheduler) {
    const drivers = this.drivers
    const main = this.main
    const cycleId = process.pid + ('000' + i++).slice(-3)
    const debug_ = debug('cycle:' + cycleId)
    const disposables = []
    const end$ = most.never().multicast()
    var disposed = false
    return scheduler.asap({
      run (t) {
        const {sources, driverProxies, dispose} = Object.keys(drivers).reduce(
          function ({sources, driverProxies, dispose}, key) {
            const driverProxy$ = driverProxies[key] = most.never().multicast()
            const source = sources[key] = drivers[key].call({
              scheduler
            }, driverProxy$.until(end$))
            return {
              sources,
              driverProxies,
              dispose: source && typeof source.dispose === 'function'
              ? () => Promise.all([source.dispose(), dispose()])
              : dispose
            }
          },
          { sources: {}, driverProxies: {}, dispose: () => void 0 }
        )

        disposables.push({ dispose })

        const mainSinks = main(sources)
        const outputSinks = Object.keys(mainSinks).reduce(function (outputSinks, key) {
          if (driverProxies[key]) return outputSinks
          outputSinks[key] = mainSinks[key]
          return outputSinks
        }, {})

        sink.event(scheduler.now(), outputSinks)

        debug_('sinks sent')

        if (disposed) return

        const dispose2 = Object.keys(mainSinks).reduce(function (dispose, key) {
          if (!driverProxies[key]) return dispose
          const debug__ = (...args) => debug_(key, ...args)
          const sink$ = mainSinks[key]
          const multicastSource = driverProxies[key].source
          const disposable = sink$.source.run({
            event: (t, e) => { debug__(e); multicastSource.event(t, e) },
            end: (t, x) => { debug__('|'); multicastSource.end(t, x) },
            error: (t, err) => { debug__('X'); multicastSource.error(t, err) }
          }, scheduler)
          return () => Promise.all([disposable.dispose(), dispose()])
        }, () => void 0)
        disposables.push({ dispose: dispose2 })
        debug_('running')
      },
      error (t, err) {
        this.dispose()
        sink.error(t, err)
      },
      dispose () {
        if (disposed) return
        disposed = true
        end$.source.event(scheduler.now(), 'end')
        return Promise.all(disposables.map((d) => d.dispose()))
          .then(() => debug_('disposed!'))
      }
    })
  }
}
module.exports = (main, drivers) => (sources) => ({
  sinks$: new most.Stream(new RunSource((driversSources) => main(Object.assign({}, sources, driversSources)), drivers)).multicast()
})
