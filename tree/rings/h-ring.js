const $ = require('../$')
const css$ = require('../css$')
const {ReducerBark} = require('../barks/state')
const H$ = require('../barks/h$')
const {Cons} = require('../list')

const hRing = pith => (elm, txt, vnode, action$, path) => {
  var i = 0
  const h = (...args) => (
    args.length === 1
    ? txt($(args[0]).map(a => a + ''))
    : args.length === 2
    ? elm(hRing)(args[0], {})(args[1])
    : args.length === 3
    ? elm(hRing)(args[0], args[1])(args[2])
    : txt('h args error ' + JSON.stringify(args))
  )
  h.vnode = vnode
  h.$ = action$
  h.path = path
  h.css$ = css$
  h.ring = hRing
  h.n = (sel, data, initState) => shpith => {
    const key = 'rnode' + i++
    const state$ = ReducerBark()(initState)(s => {
      var hpith
      s.obj('state')(s => {
        hpith = shpith(s, h.$.filter(x => x.vnode.data.path.head === key))
      })
      s('pith', $(hpith).map(hpith => () => h => {
        h.vnode(
          H$(h.ring)(
            sel,
            $(data).map(d => Object.assign({path: h.path}, d)),
            Cons(key, h.path)
          )(h => {
            hpith(h, k => s.select(k, s.select('state')))
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

  pith(h)
}

module.exports = hRing

// const rez = aTree()(a => a)((push, pop) => {
//   const p = new Proxy(() => {}, {
//     get (target, name) {
//       console.log(name)
//       return new Proxy(() => {}, this)
//     },
//     apply (target, thisArg, argumentsList) {
//       console.log('apply', thisArg, argumentsList)
//     }
//   })
//   p.a.b(1, 2)
// })
// console.log(rez)
