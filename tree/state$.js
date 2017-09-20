const $ = require('./$')
const m = require('most')
const ATree = require('./atree')

module.exports = State$

function State$ (pith, baseState = {}) {
  return $(pith)
    .map(pith => ATree(
      reduce$s => m.mergeArray(reduce$s)
        .scan((s, r) => r(s), baseState)
        .skip(1),
      chainRing(pith, baseState)
    ))
    .switchLatest()
}

function chainRing (pith, baseState) {
  return function (node, leaf) {
    pith(
      (key, pith) => leaf(m.combine(
        (key, g) => s => { s[key] = g; return s },
        $(key),
        State$(pith, baseState[key] || {})
      )),
      (key, pith) => leaf(m.combine(
        (key, g) => s => { s[key] = g; return s },
        $(key),
        State$(pith, baseState[key] || [])
      )),
      (key, r) => leaf(m.combine(
        (key, r) => s => { s[key] = r(s[key]); return s },
        $(key),
        $(r))
      )
    )
  }
}

if (require.main === module) {
  State$((o, a, v) => {
    a('a', (o, a, v) => v(0, s => s + 1))
  }, {a: [1]})
  .tap(s => console.log(JSON.stringify(s)))
  .drain()
}
