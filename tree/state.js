const $ = require('./$')
const m = require('most')
const ATree = require('./atree')

module.exports = State

function State (namespace, pith) {
  return $(pith)
    .map(pith => ATree(
      reduce$s => scope(namespace, m.mergeArray(reduce$s)),
      chainRing(pith))
    )
    .switchLatest()
}

function chainRing (pith) {
  return function (node, leaf) {
    pith(
      (namespace, pith) => leaf(State(namespace, pith)),
      reducer$ => leaf(scope('state', reducer$))
    )
  }
}

function scope (namespace, $) {
  return $.map(r => gstate => {
    if (!gstate) return { [namespace]: r(void 0) }
    gstate[namespace] = r(gstate[namespace])
    return gstate
  })
}

State('a', (n, l) => {
  l(m.of(s => 1))
  n('b', (n, l) => {
    l(m.of(s => 1))
    l(m.of(s => s + 1))
    n('c', m.periodic(1000).take(3).scan(a => a + 1, 0).map(i => (n, l) => {
      l(m.of(s => i))
    }))
  })
  l(m.of(s => s + 1))
})
.scan((state, r) => r(state), {})
.tap(s => console.log(JSON.stringify(s)))
.drain()
