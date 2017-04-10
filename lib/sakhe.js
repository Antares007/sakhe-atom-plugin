'use babel'
import { CompositeDisposable } from 'atom'
const most = require('most')

const sources = {
  action$: ((scope, actions) => new most.Stream({
    run (sink, scheduler) {
      return global.atom.commands.add(scope, actions.reduce((m, n) => {
        m[n] = function (...args) { sink.event(scheduler.now(), {action: n, args, scope}) }
        return m
      }, {}))
    }
  }).multicast())('atom-workspace', ['sakhe:toggle'])
}
const mainFn = function ({action$}) {
  return {
    Subscribe: most.of(action$.tap((a) => console.log(a)))
  }
}

export default {
  activate (state) {
    const run = require('./run.js')
    const subscriptions = this.subscriptions = new CompositeDisposable()
    this.state = state

    const drivers = {
      sources$: function sources$Driver (fn$) {
        const sources$ = most.never().multicast()
        subscriptions.add(
          fn$.map(
            (fn) => {
              const $ = most.never().multicast()
              const source = $.source
              subscriptions.add(
                fn.call(this, {
                  event: (t, e) => source.event(t, e),
                  end: (t, x) => source.end(t, x),
                  error: (t, err) => source.error(t, err)
                })
              )
              return $
            }
          ).tap(
            ($) => sources$.source.event(this.scheduler.now(), $)
          ).source.run(
            {
              event () {},
              end () {},
              error (t, err) { console.error(err.message) }
            },
            this.scheduler
          )
        )
        return sources$
      },
      // state$: function state$Driver ($) {
      //   const state$ = most.never().startWith(state).multicast()
      //   subscriptions.add(
      //     $.map((newStateFn) => newStateFn(state))
      //      .tap((newState) => { state = this.state = newState })
      //      .source.run(state$.source, this.scheduler)
      //   )
      //   return state$
      // },
      Subscribe: function SubscribeDriver (stream$$) {
        const subs$ = most.never().multicast()
        subscriptions.add(
          stream$$.tap(($) => {
            const disposable = {
              _disposable: $.source.run({
                event () {},
                end () {},
                error (t, err) { console.error(err.message) }
              }, this.scheduler),
              dispose () {
                this._disposable && this._disposable.dispose()
                delete this._disposable
              }
            }
            subscriptions.add(disposable)
            subs$.source.event(this.scheduler.now(), disposable)
          }).source.run({
            event () {},
            end () {},
            error (t, err) { console.error(err.message) }
          }, this.scheduler)
        )
        return {
          subs$
        }
      }
      // unsubscribe$: function unsubscribe$Driver (disposable$) {
      //   subscriptions.add(
      //     disposable$
      //       .tap((disposable) => disposable.dispose())
      //       .source.run({
      //         event () {},
      //         end () {},
      //         error (t, err) { console.error(err.message) }
      //       }, this.scheduler)
      //   )
      // }
    }
    subscriptions.add(
      run(mainFn, drivers)(sources).sinks$.source.run({
        event: (t, sinks) => console.info(sinks),
        end: (t, x) => console.info('bye!'),
        error: (t, err) => console.error(err)
      }, most.defaultScheduler)
    )
  },
  deactivate () {
    this.subscriptions.dispose()
  },
  serialize () {
    return this.state
  }
}
