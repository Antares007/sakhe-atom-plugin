const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject, hold} = require('most-subject')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const eq = (a, b) => {
  if (a === b) return true
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    if (Array.isArray(b) && b.length === a.length && !b.some((li, i) => !eq(a[i], li))) return true
    const akeys = Object.keys(a)
    const bkeys = Object.keys(b)
    return bkeys.length === akeys.length && !bkeys.some(key => !eq(a[key], b[key]))
  }
  return false
}
const c = (ft, k) => r => o => Object.assign(ft(), o, {[k]: r(o && o[k])})
const ABark = (pmap = id) => (ft = () => ({})) => Bark(
  m.mergeArray,
  pith => function (m) {
    pmap(pith)(
      pmap => key => pith => m(ABark(pmap)(_ => ({}))(pith).map(c(ft, key))),
      pmap => key => pith => m(ABark(pmap)(_ => ([]))(pith).map(c(ft, key))),
      (key, r) => m($(r).map(c(ft, key)))
    )
  }
)

const ArrayBark = pmap => ABark(pmap)(() => ([]))
const ObjectBark = pmap => ABark(pmap)(() => ({}))

const stateRing = state$ => pith => {
  const select = (key, $ = state$) =>
    $.filter(a => typeof a !== 'undefined' && a !== null).map(s => s[key]).skipRepeats()
  return (obj, arr, val) => pith(
    (pmap = id) => key => obj(compose(stateRing(select(key, state$)), pmap))(key),
    (pmap = id) => key => arr(compose(stateRing(select(key, state$)), pmap))(key),
    val,
    select
  )
}
const keepEqs = ft => r => o => {
  const a = r(o)
  if (typeof a === 'object' && a !== null && typeof o === 'object' && o !== null) {
    return Object.keys(a).reduce((s, key) => {
      s[key] = eq(o[key], a[key]) ? o[key] : a[key]
      return s
    }, ft())
  }
  return a
}
const apiRing = pith => (obj, arr, val, select) => {
  const s = (...args) => val(...args)
  s.select = select
  s.obj = obj(apiRing)
  s.arr = arr(apiRing)
  s.apiRing = apiRing
  s.keepEqs = keepEqs
  pith(s)
}
const ReducerBark = (pmap = apiRing) => (initState = {}, type = ObjectBark) => (pith) => {
  const state$ = hold(1, subject())
  return type(compose(stateRing(state$), pmap))(pith)
    .scan((s, r) => r(s), initState).skip(1)
    .tap(state$.next.bind(state$))
    .flatMapEnd(() => { state$.complete(); return m.empty() })
    .multicast()
}

module.exports = { ABark, ArrayBark, ObjectBark, ReducerBark, eq }

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
  })
  .take(10)
  .tap(x => console.log(x))
  .drain()
}
