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

SnabbdomRootNode(function ([g, $]) {
  g(most.of(h('div', 'hi')).merge(most.never()))

  this.node(h('div.snode'), function () {
    g(most.of(h('div', 'hi2')).merge(most.never()))
  })
})

function SnabbdomRootNode (sbody) {
  rootnode(
    function ([g, $]) {
      const updateVnodeChildren = vnode => vdom$s => {
        return most.combineArray((...vdoms) => Object.assign({}, vnode, {
          children: vdoms.map(setKeysByIndex)
        }), vdom$s)
      }
      const rnode = this.node
      const node = function (vnode, sbody) {
        rnode(function ([g, $]) {
          sbody.call({node}, [g, $])
        }, updateVnodeChildren(vnode))
      }
      sbody.call({node}, [g, $])
    },
    wrap(children => h('div#root-node', children)),
    SnabbdomDriver(document.getElementById('root-node'))
  )
}

function SnabbdomDriver (elm) {
  const modules = ['class', 'props', 'style'].map(
    name => require('snabbdom/modules/' + name).default
  )
  return function driver (r) {
    const vdom$ = most.of().map(() => r()).chain(most.from).multicast()
    const actionModule = require('./actionModule')
    const patch = snabbdom.init([
      ...modules,
      actionModule
    ])

    vdom$
      .reduce(patch, elm)
      .then(() => {
        document.body.removeChild(elm)
      })
    return actionModule.action$
  }
}

const Nil = {}
const Cons = (head, tail) => ({head, tail})

function isolateSink ($, scope) {
  return $.map(function mapVnode (vnode) {
    const scopes = vnode.scopes
    const children = vnode.children
    return Object.assign({}, vnode, {
      scopes: scopes ? Cons(scope, scopes) : Cons(scope, Nil),
      children: children ? children.map(mapVnode) : children
    })
  })
}

function isolateSource ($, scope) {
  return $.filter(({vnode}) => vnode.scopes && vnode.scopes.head === scope)
    .map((x) => Object.assign({}, x, {
      vnode: Object.assign({}, x.vnode, {
        scopes: x.vnode.scopes.tail
      })
    }))
}
