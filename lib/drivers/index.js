const most = require('most')
const makeRequire = require('./require.js')

module.exports = (require) => ({
  Require: makeRequire(require),
  Unsubscribe: function (disposable$) {
    return disposable$.source.run({
      event: (t, e) => e.dispose(),
      error: (t, err) => { throw err },
      end: (t, x) => void 0
    }, this.scheduler)
  },
  Subscribe: function ($$) {
    const subs$ = most.never().multicast()
    const disposable = $$.map(
      ($) => $.source.run({
        event: () => void 0,
        error: (t, err) => { throw err },
        end: () => void 0
      }, this.scheduler)
    ).source.run(subs$.source, this.scheduler)
    return {
      subs$,
      dispose: () => disposable.dispose()
    }
  }
})
