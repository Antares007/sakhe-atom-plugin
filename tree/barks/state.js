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

const ABark = (pmap = id) => (ft = () => ({})) => Bark(
  m.mergeArray,
  pith => function (m) {
    const c = (t, k) => r => o => {
      const a = r(o && o[k])
      return Object.assign(t, o, {[k]: a})
    }
    pmap(pith)(
      pmap => key => pith => m(ABark(pmap)(() => ({}))(pith).map(c(ft(), key))),
      pmap => key => pith => m(ABark(pmap)(() => ([]))(pith).map(c(ft(), key))),
      (key, r) => m($(r).map(c(ft(), key)))
    )
  }
)

const ArrayBark = pmap => ABark(pmap)(() => ([]))
const ObjectBark = pmap => ABark(pmap)(() => ({}))

const stateRing = state$ => pith => {
  const select = (key, $ = state$.skipRepeats().multicast()) =>
    $.map(s => s[key]).filter(a => typeof a !== 'undefined')
  return (obj, arr, val) => pith(
    (pmap = id) => key => obj(compose(stateRing(select(key, state$)), pmap))(key),
    (pmap = id) => key => arr(compose(stateRing(select(key, state$)), pmap))(key),
    val,
    select
  )
}
const apiRing = pith => (obj, arr, val, select) => {
  const s = (...args) => val(...args)
  s.select = select
  s.obj = obj(apiRing)
  s.arr = arr(apiRing)
  s.apiRing = apiRing
  pith(s)
}
const ReducerBark = (pmap = apiRing) => (initState = {}, type = ObjectBark) => (pith) => {
  const state$ = hold(1, subject())
  return type(compose(stateRing(state$), pmap))(pith)
    .scan((s, r) => r(s), initState)
    .skip(1)
    .skipRepeats()
    .flatMapEnd(() => { state$.complete(); return m.empty() })
    .tap(state$.next.bind(state$))
    .multicast()
}

module.exports = { ArrayBark, ObjectBark, ReducerBark, eq }

if (require.main === module) {
  ReducerBark()()(s => {
    // v('key', m.of(s => 'value$'))
    // s('key', s => 'value')
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
  .tap(x => console.log(x))
  .take(10)
  .drain()
}
