const $ = require('./$')
const m = require('most')
const ATree = require('./atree')

module.exports = createS$

function apiRing (state$, pith) {
  return $(pith).map(pith =>
    function apiPith (node, leaf, key) {
      const thisState$ = state$.map(s => s[key]).filter(Boolean)
      const s = (key, r) => leaf(key, $(r))
      s.o = (key, pith) => node(key, {}, apiRing(thisState$, pith))
      s.a = (key, pith) => node(key, [], apiRing(thisState$, pith))
      s.$ = thisState$.skipRepeats().multicast()
      pith(s)
    }
  )
}

function updateState (s, key, ns) {
  return (
    s[key] === ns
    ? s
    : Array.isArray(s)
    ? Array(Math.max(key + 1, s.length)).fill(null)
      .map((_, i) => i === key ? ns : s[i])
    : Object.assign({}, s, { [key]: ns })
  )
}

function chainRing (key, pith) {
  return function chainPith (node, leaf) {
    pith(
      (key, state, pith) => leaf(bark(key, state, pith)),
      (key, r) => leaf($(r).map(r => s => updateState(s, key, r(s[key])))),
      key
    )
  }
}

function bark (key, state, pith) {
  return $(pith).map(pith => ATree(
    r$s => m.mergeArray(r$s).map(r => s =>
      updateState(s, key, r(typeof s[key] === 'undefined' ? state : s[key])
    )),
    chainRing(key, pith)
  )).switchLatest()
}

function createS$ (state$) {
  return (key, pith) => bark(key, {}, apiRing(state$, pith))
}

if (require.main === module) {
  const debug = key => x => console.log(key, x)
  const {async: subject} = require('most-subject')
  const state$ = subject()
  const s$ = createS$(state$)
  s$('a', s => {
    s.$.observe(debug('a'))
    s('b', m.periodic(1000).scan(a => a + 1, 0).map(i => s => {
      s = s + i
      return s
    }))
    s.a('c', s => {
      // s.$.observe(debug('c'))
      s(2, s => 42)
    })
  })
  .scan((s, r) => r(s), { a: { b: 41 } })
  .tap(s => state$.next(s))
  .tap(debug('====='))
  .take(10)
  .drain()
}
