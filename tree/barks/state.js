const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject} = require('most-subject')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const chain = rmap$ => r => rmap$.map(rmap => rmap(r))
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

const aChain = index => r => s => {
  const l = Math.max(s.length, index + 1)
  const b = new Array(l)
  for (var i = 0; i < l; i++) {
    b[i] = i === index ? r(s[i]) : s[i]
  }
  return b
}
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

const oChain = key => r => s => Object.assign({}, s, {[key]: r(s[key])})
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
    state$.skipRepeats().multicast()
  )
}

const ReducerBark = (pmap = id) => (initState = {}) => (pith) => {
  const state$ = subject()
  return ObjectBark(compose(stateRing(state$), pmap))(pith)
    .scan((s, r) => r(s), initState)
    .skipRepeats()
    .tap(state$.next.bind(state$))
    .multicast()
}

module.exports = { ArrayBark, ObjectBark, ReducerBark }

if (require.main === module) {
  ReducerBark()()(
    (o, a, v, state$) => {
      v('key', s => 'value')
      o()('a')(
        (o, a, v, state$) => {
          v('key', s => 'value')
        }
      )
      a()('array')(
        (o, a, v, state$) => {
          state$.observe(console.log.bind(console))
          v(2, s => 42)
        }
      )
      a()('array')(
        (o, a, v, state$) => {
          v(1, s => 41)
        }
      )
    }
  )
  // .tap(debug('====='))
  .take(10)
  .drain()
}
