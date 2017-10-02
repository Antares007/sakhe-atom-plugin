const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject, hold} = require('most-subject')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const chain = rmap$ => r => rmap$.map(rmap => rmap(r))
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
  return (
    os === ns
    ? s
    : Object.assign({}, s, {[key]: ns})
  )
}

const CollectionBark = (pmap = id) => Bark(
  m.mergeArray,
  pith => function (m) {
    pmap(pith)(
      pmap => rmap$ => pith => m(ObjectBark(pmap)(pith).flatMap(chain(rmap$))),
      pmap => rmap$ => pith => m(ArrayBark(pmap)(pith).flatMap(chain(rmap$))),
      (rmap$, r) => m($(r).flatMap(chain(rmap$))),
      m
    )
  }
)

const ArrayBark = (pmap = id) => CollectionBark(
  pith => (o, a, v, m) => {
    m(s => Array.isArray(s) ? s : [])
    pmap(pith)(
      pmap => index => o(pmap)($(index).map(aChain)),
      pmap => index => a(pmap)($(index).map(aChain)),
      (index, r) => v($(index).map(aChain), r)
    )
  }
)

const ObjectBark = (pmap = id) => CollectionBark(
  pith => (o, a, v, m) => {
    m(s => typeof s === 'object' && s !== null ? s : {})
    pmap(pith)(
      pmap => key => o(pmap)($(key).map(oChain)),
      pmap => key => a(pmap)($(key).map(oChain)),
      (key, r) => v($(key).map(oChain), r)
    )
  }
)

const stateRing = state$ => pith => {
  const select = key =>
    state$.chain(s => $(key).map(key => s[key]).filter(Boolean))
  return (obj, arr, val) => pith(
    (pmap = id) => key => obj(compose(stateRing(select(key)), pmap))(key),
    (pmap = id) => key => arr(compose(stateRing(select(key)), pmap))(key),
    val,
    (key, $ = state$) => $.map(s => s[key]).filter(a => typeof a !== 'undefined').skipRepeats()
  )
}

const ReducerBark = (pmap = id) => (initState = {}) => (pith) => {
  const state$ = hold(1, subject())
  return ObjectBark(compose(stateRing(state$), pmap))(pith)
    .scan((s, r) => r(s), initState)
    .skipRepeats()
    .tap(state$.next.bind(state$))
    .multicast()
}

module.exports = { ArrayBark, ObjectBark, ReducerBark }

if (require.main === module) {
  ReducerBark()()(
    (o, a, v, select) => {
      v('key', m.of(s => 'value$'))
      o()('a')(
        (o, a, v, state$) => {
          v('key', s => 'value')
        }
      )
      a()('array')(
        (o, a, v, select) => {
          select(2).observe(console.log.bind(console))
          v(2, s => 42)
        }
      )
      a()('array')(
        (o, a, v, select) => {
          v(1, s => 41)
          v(2, s => s - 1)
        }
      )
    }
  )
  // .tap(x => console.log(x))
  .take(10)
  .drain()
}
