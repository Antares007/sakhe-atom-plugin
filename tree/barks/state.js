const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject, hold} = require('most-subject')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const aChain = index => r => s => {
  const os = s[index]
  const ns = r(os)
  if (os === ns && index < s.length) return s
  const l = Math.max(s.length, index + 1)
  const b = new Array(l)
  for (var i = 0; i < l; i++) {
    b[i] = i === index ? ns : s[i]
  }
  return b
}
const oChain = key => r => s => {
  const os = s[key]
  const ns = r(os)
  return (os === ns ? s : Object.assign({}, s, {[key]: ns}))
}
const aInitState = s => Array.isArray(s) ? s : []
const oInitState = s => typeof s === 'object' && s !== null ? s : {}

const CollectionBark = (pmap = id) => Bark(
  m.mergeArray,
  pith => function (m) {
    pmap(pith)(
      pmap => rmap => pith => m(ObjectBark(pmap)(pith).map(rmap)),
      pmap => rmap => pith => m(ArrayBark(pmap)(pith).map(rmap)),
      (rmap, r) => m($(r).map(rmap))
    )
  }
)

const ArrayBark = (pmap = id) => CollectionBark(
  pith => (o, a, v) => {
    pmap(pith)(
      pmap => index => o(pmap)(r => s => aChain(index)(r)(aInitState(s))),
      pmap => index => a(pmap)(r => s => aChain(index)(r)(aInitState(s))),
      (index, r) => v(r => s => aChain(index)(r)(aInitState(s)), r)
    )
  }
)

const ObjectBark = (pmap = id) => CollectionBark(
  pith => (o, a, v) => {
    pmap(pith)(
      pmap => key => o(pmap)(r => s => oChain(key)(r)(oInitState(s))),
      pmap => key => a(pmap)(r => s => oChain(key)(r)(oInitState(s))),
      (key, r) => v(r => s => oChain(key)(r)(oInitState(s)), r)
    )
  }
)

const stateRing = state$ => pith => {
  const select = (key, $ = state$.skipRepeats().multicast()) =>
    $.map(s => s[key])
      .filter(a => typeof a !== 'undefined')
  return (obj, arr, val) => pith(
    (pmap = id) => key => obj(compose(stateRing(select(key, state$)), pmap))(key),
    (pmap = id) => key => arr(compose(stateRing(select(key, state$)), pmap))(key),
    val,
    select
  )
}

const ReducerBark = (pmap = id) => (initState = {}) => (pith) => {
  const state$ = hold(1, subject())
  return ObjectBark(compose(stateRing(state$), pmap))(pith)
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
        o()('a')((o, a, v, state$) => {
          v('key', s => 'value')
        })
      })
    })
    a()('array')((o, a, v, select) => {
      v(2, s => 42)
    })
    a()('array')((o, a, v, select) => {
      v(1, s => 41)
      v(2, s => s - 1)
    })
    select('array').observe(console.log.bind(console))
  })
  // .tap(x => console.log(x))
  .take(10)
  .drain()
}
