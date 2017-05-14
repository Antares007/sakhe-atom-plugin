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
    g(most.of(h('div', '1')).merge(most.periodic(1000).take(100)))
    $.observe(x => console.log('root', x))

    this.node(function ([g, $]) {
      g(most.of(h('div', '1.1')))

      this.node(function ([g, $]) {
        g(most.of(h('button', {on: {click: 'aaa'}}, '1.1.1')))
        $.observe(x => console.log('aaa', x))
      }, wrap(children => h('div.node', children)))
      this.node(function ([g, $]) {
        g(most.of(h('button', {on: {click: 'bbb'}}, '1.1.2')))
        $.observe(x => console.log('bbb', x))
      }, wrap(children => h('div.node', children)))
      g(most.of(h('div', '1.2')))
    }, wrap(children => h('div.node', children)))

    g(most.of(h('div', '2')))
  },
  wrap(children => h('div#root-node', children)),
  SnabbdomDriver(document.getElementById('root-node')),
  isolateSink,
  isolateSource
)

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
