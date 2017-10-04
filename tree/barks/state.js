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

const ReducerBark = (pmap = id) => (initState = {}, type = ObjectBark) => (pith) => {
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
  ReducerBark()()((o, a, v, select) => {
    // v('key', m.of(s => 'value$'))
    o()('a')((o, a, v, state$) => {
      o()('a')((o, a, v, state$) => {
        v('key', s => 'value')
      })
    })
    a()('array')((o, a, v, select) => {
      v(2, s => 42)
    })
    a()('array')((o, a, v, select) => {
      v(1, s => 41)
      v(2, s => s - 1)
    })
    // select('array').observe(console.log.bind(console))
  })
  .tap(x => console.log(x))
  .take(10)
  .drain()
}
