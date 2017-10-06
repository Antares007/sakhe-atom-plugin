const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject, hold} = require('most-subject')
const id = a => a
const cmp = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const c = (ft, k) => r => a => {
  const ak = a && a[k]
  const bk = r(ak)
  if (ak === bk) return a
  return Object.assign(ft(), a, {[k]: bk})
}

const ABark = (pmap = id) => (ft = () => ({})) => Bark(
  pith => function (m) {
    pmap(pith)(
      pmap => key => pith => m(ABark(pmap)(_ => ({}))(pith).map(c(ft, key))),
      pmap => key => pith => m(ABark(pmap)(_ => ([]))(pith).map(c(ft, key))),
      (key, r) => m($(r).map(c(ft, key)))
    )
  }
)(m.mergeArray)

const stateRing = state$ => pith => {
  const select = ($, key) =>
    $.filter(s => typeof s !== 'undefined' && s !== null).map(s => s[key])
  const stateHub$ = hold(1, state$)
  return (obj, arr, val) => pith(
    (pmap = id) => key => obj(cmp(stateRing(select(state$, key)), pmap))(key),
    (pmap = id) => key => arr(cmp(stateRing(select(state$, key)), pmap))(key),
    val,
    selectors => selectors.reduce(select, stateHub$)
      .filter(s => typeof s !== 'undefined')
      .skipRepeats()
  )
}

const ReducerBark =
  (pmap = require('../rings/s-ring')) =>
  (initState = {}, ft = _ => ({})) =>
  (pith) => {
    const state$ = hold(1, subject())
    return ABark(cmp(stateRing(state$), pmap))(ft)(pith)
      .scan((s, r) => r(s), ft())
      .skip(1)
      .skipRepeats()
      .tap(state$.next.bind(state$))
      .flatMapEnd(() => { state$.complete(); return m.empty() })
      .multicast()
  }

module.exports = { ReducerBark }

if (require.main === module) {
  ReducerBark()()(s => {
    s.put('lis', m.periodic(100).scan(a => a + 1, 0).map(i => ({
      // a: { k: 'v', d: { k: 'v', d: (i % 6) === 0 } },
      b: { k: 'v', d: { k: 'v', d: (i % 30) === 0 }, c: (i % 30) === 0 }
    })))
  })
  .tap(x => console.log(x))
  .take(10)
  .drain()
}
