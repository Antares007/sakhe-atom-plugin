const debug = require('debug') // eslint-disable-line
const m = require('most') // eslint-disable-line
const watch$ = require('./watch$')
const eq = require('../eq')
const H$ = require('../barks/h$') // eslint-disable-line
const {Cons} = require('../list') // eslint-disable-line
const {join: pathJoin} = require('path') // eslint-disable-line
// const id = a => a
const PatchBark = require('../barks/patch')

const Folder = path => h => { // eslint-disable-line
  h.n('div', {}, {})((s, action$) => {
    s.put('lis', watch$(path).map(es =>
      Object.keys(es).reduce((s, key) => {
        const {size, mode, mtime} = es[key]
        s[key] = {size, mode, mtime, isDir: !!(mode & parseInt('040000', 8))}
        return s
      }, {})
    ))
    // s.select(['lis']).scan((oldLis, lis) => {
    //   const newLis = {}
    //   for (let name in lis) {
    //     newLis[name] =
    //   }
    //   return newLis
    // }, {})
    return s.select(['lis'])
      .filter(lis => Object.keys(lis).length > 0)
      .skipRepeatsWith((a, b) => eq(Object.keys(a).sort(), Object.keys(b).sort()))
      .map(lis => (h, select) => {
        h('ul', h => {
          for (let name in lis) {
            h('li', {key: name, path: h.path}, select(['lis', name]).map(li => h => {
              h(name)
              h(' - ')
              h(Math.random())
            }))
          }
          h(Math.random())
        })
      })
  })
}

PatchBark()(document.getElementById('root-node'))(h => {
  h(h.$.tap(debug('root')).map(x => x.action).startWith('n/a'))
  h.n('div.a')((s, action$) => {
    s.put('count', action$.map(x => x.action).scan((s, a) => s + a, 0))
    return (h, select) => {
      h('button', {on: {click: +1}}, h => h('+'))
      h('button', {on: {click: -1}}, h => h('-'))
      h(select(['count']))
    }
  })
  h('div', Folder(pathJoin(__dirname, '..')))
  // Folder(__dirname + '/..')
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
