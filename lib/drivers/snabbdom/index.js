const most = require('most')
const snabbdom = require('snabbdom')
const h = snabbdom.h
const rootnode = require('../../rootnode.js')

const setKeysByIndex = (x, i) => {
  if (x && x.key) {
    x.key = i
  }
  return x
}
const wrap = (f) => vdom$s =>
  most.combineArray((...vdoms) => f(vdoms.map(setKeysByIndex)), vdom$s)

rootnode(
  function ([g, $]) {
    console.log('cb root')
    g(most.of(h('div', '1')).merge(most.never()))

    this.node(function ([g, $]) {
      console.log('cb node')
      g(most.of(h('div', '1.1')).merge(most.never()))

      this.node(function ([g, $]) {
        console.log('cb node')
        g(most.of(h('div', '1.1.1')).merge(most.never()))
      }, wrap(children => h('div.node', children)))

      g(most.of(h('div', '1.2')).merge(most.never()))
    }, wrap(children => h('div.node', children)))

    g(most.of(h('div', '2')).merge(most.never()))
  },
  wrap(children => h('div#root-node', children)),
  SnabbdomDriver(document.getElementById('root-node'))
)

function SnabbdomDriver (elm) {
  const modules = ['class', 'props', 'style'].map(
    name => require('snabbdom/modules/' + name).default
  )
  return function driver (r) {
    const vdom$ = most.of().map(() => r()).chain(most.from).multicast()
    const patch = snabbdom.init(modules)
    vdom$
      .tap(vnode => console.log(vnode))
      .reduce(patch, elm)
      .then(() => {
      })
    return most.empty()
  }
  // most.periodic(2000).until(vnode$.flatMapEnd(most.of))
  //   .map(() =>
  //     vnode$
  //       .until(most.periodic(1000).skip(1))
  //       .reduce(c => c + 1, 0)
  //   ).await()
  //   .observe(c => console.log('nps: ' + c + '/s'))
}

// const {Source, Sink} = require('../../source')
// const Nil = {}
// const Cons = (head, tail) => ({head, tail})
// class SnabbdomSink extends Sink {
//   isolate (scope) {
//     return this.contramap($ =>
//       $.map(function mapVnode (vnode) {
//         const scopes = vnode.scopes
//         const children = vnode.children
//         return Object.assign({}, vnode, {
//           scopes: scopes ? Cons(scope, scopes) : Cons(scope, Nil),
//           children: children ? children.map(mapVnode) : children
//         })
//       })
//     )
//   }
// }
// class SnabbdomSource extends Source {
//   isolate (scope) {
//     return this.map($ =>
//       $.filter(({vnode}) => vnode.scopes && vnode.scopes.head === scope)
//       .map((x) => Object.assign({}, x, {
//         vnode: Object.assign({}, x.vnode, {
//           scopes: x.vnode.scopes.tail
//         })
//       }))
//     )
//   }
// }
//
