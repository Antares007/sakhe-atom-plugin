const $ = require('../$')
const css$ = require('../css$')

const hRing = pith => (elm, txt, vnode, path, action$) => {
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
