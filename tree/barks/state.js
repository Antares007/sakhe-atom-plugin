const m = require('most')
const $ = require('../$')
const Bark = require('./bark')
const id = a => a

module.exports = { ArrayBark, ObjectBark }

function CollectionBark (rmap, chain, pith, pmap = id) {
  return Bark(
    r$s => m.mergeArray(r$s).map(rmap),
    pith,
    pith => function (leaf) {
      pmap(pith)(
        (index, pith, pmap = id) => leaf(ObjectBark(pith, pmap).flatMap(chain(index))),
        (index, pith, pmap = id) => leaf(ArrayBark(pith, pmap).flatMap(chain(index))),
        (index, r) => leaf($(r).flatMap(chain(index)))
      )
    }
  )
}

function ArrayBark (pith, pmap = id) {
  return CollectionBark(
    r => s => Array.isArray(s) ? r(s) : r([]),
    index => r => $(index).map(index => s => {
      var l = Math.max(s.length, index + 1)
      var b = new Array(l)
      for (var i = 0; i < l; i++) {
        b[i] = i === index ? r(s[i]) : s[i]
      }
      return b
    }),
    pith,
    pmap
  )
}

function ObjectBark (pith, pmap = id) {
  return CollectionBark(
    r => s => typeof s === 'object' && s !== null ? r(s) : r({}),
    index => r => $(index).map(key => s => Object.assign({}, s, {[key]: r(s[key])})),
    pith,
    pmap
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
