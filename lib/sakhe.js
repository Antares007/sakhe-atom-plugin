'use babel'
import SakheView from './sakhe-view'
import { CompositeDisposable } from 'atom'
const most = require('most')
const mainFn = function ({sources$}) {
  // const action$ = source$$.flatMap(({action$}) => action$) // eslint-disable-line
  return {
    Subscribe: most.of(
      sources$
        .take(1)
        .flatMap(($) => $)
        .tap((a) => console.log(a))
    ),
    sources$: most.of(function ({event, end, error}) {
      return global.atom.commands.add('atom-workspace', {
        'sakhe:toggle': () => event(this.scheduler.now(), {action: 'sakhe:toggle'})
      })
    })
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
      run(mainFn, drivers)().sinks$.source.run({
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

const package0 = {
  sakheView: null,
  modalPanel: null,
  subscriptions: null,

  activate (state) {
    this.sakheView = new SakheView(state.sakheViewState)
    this.modalPanel = global.atom.workspace.addModalPanel({
      item: this.sakheView.getElement(),
      visible: false
    })

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(global.atom.commands.add('atom-workspace', {
      'sakhe:toggle': () => this.toggle()
    }))
  },

  deactivate () {
    this.modalPanel.destroy()
    this.subscriptions.dispose()
    this.sakheView.destroy()
  },

  serialize () {
    return {
      sakheViewState: this.sakheView.serialize()
    }
  },

  toggle () {
    console.log('Sakhe was toggled!')
    return (
      this.modalPanel.isVisible()
        ? this.modalPanel.hide()
        : this.modalPanel.show()
    )
  }
}
package0
