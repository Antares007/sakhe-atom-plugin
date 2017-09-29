const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const {async: subject} = require('most-subject')
const id = a => a

module.exports = { ArrayBark, ObjectBark, ReducerBark }

function CollectionBark (pith, pmap = id, cmap = id) {
  return Bark(
    cmap(r$s => m.mergeArray(r$s)),
    pith,
    pith => function (leaf) {
      pmap(pith)(
        (chain, pith, pmap = id) => leaf(ObjectBark(pith, pmap).flatMap(chain)),
        (chain, pith, pmap = id) => leaf(ArrayBark(pith, pmap).flatMap(chain)),
        (chain, r) => leaf($(r).flatMap(chain))
      )
    }
  )
}

function ArrayBark (pith, pmap = id) {
  const mkChain = index => r => $(index).map(index => s => {
    var l = Math.max(s.length, index + 1)
    var b = new Array(l)
    for (var i = 0; i < l; i++) {
      b[i] = i === index ? r(s[i]) : s[i]
    }
    return b
  })
  return CollectionBark(
    pith,
    pith => (o, a, v) => pmap(pith)(
      (index, pith, pmap = id) => o(mkChain(index), pith, pmap),
      (index, pith, pmap = id) => a(mkChain(index), pith, pmap),
      (index, r) => v(mkChain(index), r)
    ),
    dc => r$s => dc(r$s).map(r => s => Array.isArray(s) ? r(s) : r([]))
  )
}

function ObjectBark (pith, pmap = id) {
  const mkChain = index => r => $(index)
    .map(key => s => Object.assign({}, s, {[key]: r(s[key])}))
  return CollectionBark(
    pith,
    pith => (o, a, v) => pmap(pith)(
      (key, pith, pmap = id) => o(mkChain(key), pith, pmap),
      (key, pith, pmap = id) => a(mkChain(key), pith, pmap),
      (key, r) => v(mkChain(key), r)
    ),
    dc => r$s => dc(r$s).map(r => s => typeof s === 'object' && s !== null ? r(s) : r({}))
  )
}

function ReducerBark (pith, initState) {
  const state$ = subject()
  return ObjectBark(pith, pith => keyRing(state$, apiRing(pith)))
    .scan((s, r) => r(s), initState)
    .skip(initState ? 0 : 1)
    .tap(state$.next.bind(state$))
}

function apiRing (pith) {
  return (obj, arr, val, state$) => {
    const r = (key, v) => val(key, v)
    r.o = (key, pith, pmap = id) => obj(key, pith, path => apiRing(pmap(path)))
    r.a = (key, pith, pmap = id) => arr(key, pith, path => apiRing(pmap(path)))
    r.$ = state$
    pith(r)
  }
}

function keyRing (state$, pith) {
  const select = key => state$.flatMap(
    s => $(key).map(key => s[key]).filter(Boolean)
  )
  return (obj, arr, val) => pith(
    (key, pith, pmap = id) => obj(key, pith, path => keyRing(select(key), pmap(path))),
    (key, pith, pmap = id) => arr(key, pith, path => keyRing(select(key), pmap(path))),
    val,
    state$.skipRepeats().multicast()
  )
}

if (require.main === module) {
  const util = require('util')
  const debug = key => x => console.log(key, util.inspect(x, {depth: 20}))

  ReducerBark(r => {
    r.a('myArray', r => {
      r.$.observe(console.log.bind(console))
      r(0, s => 42)
    })
    r('a', s => 41)
  })
  .tap(debug('====='))
  .take(10)
  .drain()
}
