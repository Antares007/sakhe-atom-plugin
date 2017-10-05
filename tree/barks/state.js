const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject, hold} = require('most-subject')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const c = (ft, k) => r => o => Object.assign(ft(), o, {[k]: r(o && o[k])})
const ABark = (pmap = id) => (ft = () => ({})) => Bark(
  pith => function (m) {
    pmap(pith)(
      pmap => key => pith => m(ABark(pmap)(_ => ({}))(pith).map(c(ft, key))),
      pmap => key => pith => m(ABark(pmap)(_ => ([]))(pith).map(c(ft, key))),
      (key, r) => m($(r).map(c(ft, key)))
    )
  }
)(m.mergeArray)

const stateRing = select => pith => {
  return (obj, arr, val) => pith(
    (pmap = id) => key => obj(compose(stateRing(k => select(k, select(key))), pmap))(key),
    (pmap = id) => key => arr(compose(stateRing(k => select(k, select(key))), pmap))(key),
    val,
    (key, $) => select(key, $)
      .filter(a => typeof a !== 'undefined' && a !== null)
      .skipRepeats()
  )
}

const sRing = require('../rings/s-ring')

const ObjectBark = (pmap = sRing) => (select = _ => m.never()) =>
  ABark(compose(stateRing(select), pmap))(_ => ({}))

const ArrayBark = (pmap = sRing) => (select = _ => m.never()) =>
  ABark(compose(stateRing(select), pmap))(_ => ([]))

const ReducerBark =
  (pmap = sRing) =>
  (initState = {}, ft = _ => ({})) =>
  (pith) => {
    const state$ = hold(1, subject())
    const select = (key, $ = state$) =>
      $.filter(a => typeof a !== 'undefined' && a !== null).map(s => s[key])
    return ABark(compose(stateRing(select), pmap))(ft)(pith)
      .scan((s, r) => r(s), ft()).skip(1)
      .tap(state$.next.bind(state$))
      .flatMapEnd(() => { state$.complete(); return m.empty() })
      .multicast()
  }

module.exports = Object.assign(ReducerBark, { ObjectBark, ArrayBark, ReducerBark })

if (require.main === module) {
  ReducerBark()()(s => {
    s.obj('a')(s => {
      s.obj('a')(s => {
        s('key', s => 'value')
      })
    })
    s.arr('array')(s => s(2, s => 42))
    s.arr('array')(s => {
      s(1, s => 41)
      s(2, s => s - 1)
    })
    s.select('key', s.select('a', s.select('a'))).tap(x => console.log(x)).drain()
    s.select(2, s.select('array')).tap(x => console.log(x)).drain()
  })
  .take(10)
  .drain()
}
