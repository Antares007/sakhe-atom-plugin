const ATree = require('./atree')
const m = require('most')

const setKey = (vnode, i) => Object.assign({}, vnode, { key: i })

const applyChildren = (viewFn$, vdom$s) =>
  vdom$s.length === 0
    ? viewFn$.map(vf => vf([]))
    : viewFn$.ap(m.combineArray((...vdoms) => vdoms.map(setKey), vdom$s))

const vnodeBark = function vnodeBark (viewFn$, pith) {
  return ATree(vdom$s => {
    if (vdom$s.length !== 1) throw new TypeError(vnodeBark.toString())
    return vdom$s[0]
  })(function (push) {
    const children$s = []
    pith(children$s.push.bind(children$s))
    push(applyChildren(viewFn$, children$s))
  })
}

module.exports = vnodeBark

// const div = (sel = '', data = {}) => m.of(children => h('div' + sel, data, children))
// const h$ = (...args) => m.of(h(...args))

// vnodeBark(div('#root-node'), function (push) {
//   push(
//     h$('div', 'hi3'),
//     vnodeBark(div('.node1'), function (push) {
//       push(
//         h$('div', 'hi3'),
//         vnodeBark(div('.node2'), function (push) {
//           push(
//             vnodeBark(div('.node3'), function (push) {
//             })
//           )
//         })
//       )
//     })
//   )
// }).observe(console.log.bind(console))
