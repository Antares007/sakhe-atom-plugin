const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const id = a => a

module.exports = { ArrayBark, ObjectBark }

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

if (require.main === module) {
  const util = require('util')
  const debug = key => x => console.log(util.inspect(x, {depth: 20}))

  ObjectBark((o, a, v) => {
    a('myArray', (o, a, v) => {
      v(2, s => s + 1)
    })
    v('a', s => s + 1)
  })
  .scan((s, r) => r(s), { a: 1, myArray: [ 1, 2, 2, 4 ] })
  .tap(debug('====='))
  .take(10)
  .drain()
}
