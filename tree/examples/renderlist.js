const debug = require('debug')
// const m = require('most')
// const id = a => a
// const watch$ = require('./watch$')
const eq = require('../eq')
const PatchBark = require('../barks/patch')

const list$ = require('./watch$')(__dirname)
  .map(es => Object.keys(es).map(key => {
    const stat = es[key]
    const name = key
    const size = stat.size
    const mode = stat.mode
    const mtime = stat.mtime.getTime()
    return {name, size, mode, mtime, modestr: mode.toString(8)}
  })).tap(debug('list$'))

PatchBark()(document.getElementById('root-node'))(h => {
  const rez$ = h.n('div', {}, {})((s, action$) => {
    s.put('lis', list$.map(list => list.reduce((s, li) => {
      s[li.name] = li
      return s
    }, {})).tap(debug('lis to put')))
    s.put('return', 'result')
    return s.select(['lis'])
      .filter(lis => Object.keys(lis).length > 0)
      .skipRepeatsWith((a, b) => eq(Object.keys(a).sort(), Object.keys(b).sort()))
      .map(lis => (h, select) => {
        h('ul', h => {
          for (let name in lis) {
            h('li', {key: name}, select(['lis', name]).map(li => h => {
              h(name)
              h(' - ')
              h(li.modestr)
              h(' - ')
              h(Math.random())
              // h(new Date(li.mtime).toLocaleString())
            }))
          }
        })
        h(Math.random())
      })
  })
  h(rez$.startWith('hi'))
})
  .drain()

// PatchBark()(document.getElementById('root-node'))(h => {
//   const node = (sel, data, list$, keymap, eq, limap) => {
//     const state$ = ReducerBark()()(s => {
//       s('lis', list$.map(list => s => list.reduce((s, li) => {
//         s[li.name] = li
//         return s
//       }, {})).map(s.keepEqs(_ => ({}))))
//       s(
//         'pith',
//         s.select('lis')
//           .skipRepeatsWith((a, b) => eq(Object.keys(a).sort(), Object.keys(b).sort()))
//           .map(lis => () => h => {
//             h('ul', h => {
//               for (let name in lis) {
//                 h('li', {key: name}, s.select(name, s.select('lis')).skipRepeats().map(li => h => {
//                   h(li.name + ' - ')
//                   h(li.atime)
//                   h(Math.random())
//                 }))
//               }
//             })
//             h(Math.random())
//           })
//       )
//     }).multicast()
//     h(sel, data, state$.map(s => s.pith).filter(Boolean).skipRepeats())
//     return state$
//   }
//
//   const list$ = watch$(__dirname)
//     .map(es => Object.keys(es).map(key => {
//       const stat = es[key]
//       const name = key
//       const size = stat.size
//       const mode = stat.mode
//       const atime = stat.atime.getTime()
//       const isDir = stat.isDirectory()
//       return {name, size, mode, atime, isDir}
//     }))
//
//   // h(list$.map(x => JSON.stringify(x)))
//   node(
//     'div',
//     {},
//     list$,
//     li => li.name,
//     (a, b) => (
//       a && b &&
//       a.name === b.name &&
//       a.size === b.size &&
//       a.mode === b.mode &&
//       a.atime === b.atime &&
//       a.isDir === b.isDir
//     ),
//     li => H$(h.apiRing)('li')(h => h(li.name))
//   )
//   // .tap(x => console.log(x))
//   // .drain()
// })
//   // .debounce(100)
//   // .tap(x => x.log(x))
//   .drain()
