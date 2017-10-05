// const m = require('most')

const {ReducerBark, ObjectBark} = require('../barks/state')
const H$ = require('../barks/h$')
const PatchBark = require('../barks/patch')

const {Cons} = require('../list')
// const id = a => a
const $ = require('../$')
// const watch$ = require('./watch$')
// const eq = require('../eq')

PatchBark()(document.getElementById('root-node'))(h => {
  var i = 0
  const n = (sel, data, initState) => shpith => {
    const key = 'rnode' + (i++)
    const state$ = ReducerBark()(initState)(s => {
      var hpith$
      s.obj('state')(s => {
        hpith$ = shpith(s, h.$.filter(x => x.vnode.data.path.head === key))
      })
      s('pith', hpith$.map(hpith => () => h => {
        h.vnode(
          H$(h.ring)(
            sel,
            $(data).map(d => Object.assign({path: h.path}, d)),
            Cons(key, h.path)
          )(h => {
            hpith(h, s.select('state'))
          })
        )
      }))
    })
    h(
      'div.rnode',
      {key},
      state$.map(s => s.pith)
        .filter(f => typeof f === 'function')
        .skipRepeats()
    )
    return state$
      .map(s => s.state).filter(Boolean)
      .map(s => s.return).filter(a => typeof a !== 'undefined' && a !== null)
      .skipRepeats()
  }
  const rez$ = n('div', {}, {})((s, action$) => {
    s('a', s => 'hello from state')
    s('return', s => 'hi from state')
    return s.select('a').filter(Boolean).map(a => (h, select) => {
      h(a)
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
