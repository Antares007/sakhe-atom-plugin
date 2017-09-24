const $ = require('./$')
const m = require('most')
const ATree$ = require('./atree$')

module.exports = createS$

function apiRing (state$, pith) {
  return $(pith).map(pith =>
    function apiPith (node, leaf, key) {
      const thisState$ = state$.map(s => s[key]).filter(Boolean)
      const s = (...args) => {
        args.length === 3
        ? node(args[0], args[1], apiRing(thisState$, args[2]))
        : args.length === 2
        ? leaf(...args)
        : leaf('arguments error', $(s => args))
      }
      s.$ = thisState$.skipRepeats()
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

function makeDeltac (key, state) {
  return m.combine(
    (key, state) => r$s => m.mergeArray(r$s).map(r => s =>
      updateState(s, key, r(typeof s[key] === 'undefined' ? state : s[key]))
    ),
    $(key),
    $(state)
  )
}

function chainRing (key, pith) {
  return m.combine((key, pith) =>
    function chainPith (node, leaf) {
      pith(
        (key, state, pith) => node(
          makeDeltac(key, state),
          chainRing(key, pith)
        ),
        (key, reducer) => leaf(m.combine(
          (key, r) => s => updateState(s, key, r(s[key])),
          $(key),
          $(reducer)
        )),
        key
      )
    },
    $(key),
    $(pith)
  )
}

function createS$ (state$) {
  return (key, state, pith) => ATree$(
    makeDeltac(key, state),
    chainRing(key, apiRing(state$, pith))
  )
}

if (require.main === module) {
  const debug = key => x => console.log(key, x)
  const {async: subject} = require('most-subject')
  const state$ = subject()
  const s = createS$(state$)
  s('a', {}, s => {
    s.$.observe(debug('a'))
    s('b', m.of(s => {
      s = s + 1
      return s
    }))
    s('c', [], s => {
      // s.$.observe(debug('c'))
      s(m.periodic(1000).scan(a => a + 1, 0), s => 42)
    })
  })
  .scan((s, r) => r(s), { a: { b: 41 } })
  .tap(s => state$.next(s))
  .tap(debug('====='))
  .take(5)
  .drain()
}
