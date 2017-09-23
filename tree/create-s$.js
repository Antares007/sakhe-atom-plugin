const $ = require('./$')
const m = require('most')
const ATree$ = require('./atree$')

module.exports = createS$

function createS$ (state$) {
  const apiRing = (state$, pith) => $(pith).map(pith =>
    function apiPith (node, leaf, key) {
      const s = (...args) => {
        args.length === 3
        ? node(args[0], args[1], apiRing(state$.map(s => s[key]).filter(Boolean), args[2]))
        : args.length === 2
        ? leaf(...args)
        : leaf('arguments error', $(s => args))
      }
      s.$ = state$
      pith(s)
    }
  )

  const makeDeltac = (key, state) => m.combine(
    (key, state) =>
      r$s => m.mergeArray(r$s).map(r => s => { s[key] = r(state); return s }),
    $(key),
    $(state)
  )
  const chainRing = (key, pith) => $(pith).map(pith =>
    function chainPith (node, leaf) {
      pith(
        (key, state, pith) => node(makeDeltac(key, state), chainRing(key, pith)),
        (key, reducer) => leaf(m.combine(
          (key, r) =>
            s => { s[key] = r(s[key]); return s },
            $(key),
            $(reducer)
        )),
        key
      )
    }
  )

  return (key, state, pith) => ATree$(
    makeDeltac(key, state),
    chainRing(key, apiRing(state$, pith))
  )
}

if (require.main === module) {
  const s = createS$(m.never())
  s('a', {}, s => {
    s('b', s => 1)
    s('c', m.periodic(1000).scan(a => a + 1, 0).map(i => i % 2 === 0 ? {} : []), s => {
      s(m.periodic(300).skip(1).scan(a => a + 1, 0), s => 42)
    })
  })
  .scan((s, r) => r(s), {})
  .tap(s => console.log(JSON.stringify(s)))
  .take(13)
  .drain()
}
