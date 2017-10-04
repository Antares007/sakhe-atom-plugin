const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject, hold} = require('most-subject')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const CollectionBark = (pmap = id) => c => Bark(
  m.mergeArray,
  pith => function (m) {
    pmap(pith)(
      pmap => key => pith => m(ObjectBark(pmap)(pith).map(c(key))),
      pmap => key => pith => m(ArrayBark(pmap)(pith).map(c(key))),
      (key, r) => m($(r).map(c(key)))
    )
  }
)

const ArrayBark = pmap => CollectionBark(pmap)(index => r => s => {
  var b
  if (!Array.isArray(s)) {
    b = (new Array(index + 1)).fill(void 0)
    b[index] = r(void 0)
    return b
  }
  const os = s[index]
  const ns = r(os)
  if (os === ns && index < s.length) return s
  const l = Math.max(s.length, index + 1)
  b = new Array(l)
  for (var i = 0; i < l; i++) {
    b[i] = i === index ? ns : s[i]
  }
  return b
})

const ObjectBark = pmap => CollectionBark(pmap)(key => r => s => {
  if (typeof s !== 'object' || s === null) return {[key]: r()}
  const os = s[key]
  const ns = r(os)
  return (os === ns ? s : Object.assign({}, s, {[key]: ns}))
})

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

module.exports = { ArrayBark, ObjectBark, ReducerBark }

if (require.main === module) {
  ReducerBark()()(s => {
    // v('key', m.of(s => 'value$'))
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
