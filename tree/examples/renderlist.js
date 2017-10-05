const m = require('most')
const {ReducerBark} = require('../barks/state')
const PatchBark = require('../barks/patch')
const H$ = require('../barks/h$')

// const $ = require('../$')
// const r$ = r => $(r).map(v => () => v)
const watch$ = require('./watch$')
const aframe$ = require('./animation-frame').multicast()
// const pi2 = Math.PI * 2
// const PIcycle$ = (speed = 0.15) => frame$.scan(i => i >= pi2 ? 0 : i + speed, 0)

// // pairwise :: a -> Stream a -> Stream (a, a)
// const pairwise = (initial, stream) => m.loop(
//   (prev, current) => ({ seed: current, value: [prev, current] }),
//   initial,
//   stream
// )
const eq = (a, b) => {
  if (a === b) return true
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    if (Array.isArray(b) && b.length === a.length && !b.some((li, i) => !eq(a[i], li))) return true
    const akeys = Object.keys(a)
    const bkeys = Object.keys(b)
    return bkeys.length === akeys.length && !bkeys.some(key => !eq(a[key], b[key]))
  }
  return false
}
PatchBark()(document.getElementById('root-node'))(h => {
  const node = (sel, data, list$, keymap, eq, limap) => {
    const state$ = ReducerBark()()(s => {
      s('lis', list$.map(list => s => list.reduce((s, li) => {
        s[li.name] = li
        return s
      }, {})).map(s.keepEqs(_ => ({}))))
      s(
        'pith',
        s.select('lis')
          .skipRepeatsWith((a, b) => eq(Object.keys(a).sort(), Object.keys(b).sort()))
          .map(lis => () => h => {
            h('ul', h => {
              for (let name in lis) {
                h('li', {key: name}, s.select(name, s.select('lis')).skipRepeats().map(li => h => {
                  h(li.name + ' - ')
                  h(li.atime)
                  h(Math.random())
                }))
              }
            })
            h(Math.random())
          })
      )
    }).multicast()
    h(sel, data, state$.map(s => s.pith).filter(Boolean).skipRepeats())
    return state$
  }

  const list$ = watch$(__dirname)
    .map(es => Object.keys(es).map(key => {
      const stat = es[key]
      const name = key
      const size = stat.size
      const mode = stat.mode
      const atime = stat.atime.getTime()
      const isDir = stat.isDirectory()
      return {name, size, mode, atime, isDir}
    }))

  // h(list$.map(x => JSON.stringify(x)))
  node(
    'div',
    {},
    list$,
    li => li.name,
    (a, b) => (
      a && b &&
      a.name === b.name &&
      a.size === b.size &&
      a.mode === b.mode &&
      a.atime === b.atime &&
      a.isDir === b.isDir
    ),
    li => H$(h.apiRing)('li')(h => h(li.name))
  )
  // .tap(x => console.log(x))
  // .drain()
})
  // .debounce(100)
  // .tap(x => x.log(x))
  .drain()
