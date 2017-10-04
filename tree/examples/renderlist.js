// const m = require('most')
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

PatchBark()(document.getElementById('root-node'))(h => {
  // h(aframe$.scan(a => a + 1, 0))
  // var i = 0
  const node = (sel, data, list$, keymap, eq, pithmap) => {
    // const key = 'node' + i++
    const state$ = ReducerBark()()(s => {
      s.arr('vnode$s')(s => {
        for (let i = 0; i < 5; i++) {
          s(i, s =>
            H$(h.apiRing)(sel, data)(h => {
              h(aframe$.scan(a => a + i / 1000, 0)
                .map(i => Math.floor(i * 10 + 0.5))
                .skipRepeats()
              )
              h('a')
            })
          )
        }
      })
      s(
        'pith',
        s.select('vnode$s')
          .skipRepeatsWith((a, b) => a.length === b.length)
          .map(vnode$s => () => h => {
            vnode$s.forEach(h.vnode)
            h(Math.random())
          })
      )
    }).multicast()
    h(sel, data, state$.map(s => s.pith).filter(Boolean))
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

  h(list$.map(x => JSON.stringify(x)))
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
    li => h => h(li.name)
  )
})
  // .debounce(100)
  // .tap(x => x.log(x))
  .drain()
