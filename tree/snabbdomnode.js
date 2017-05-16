const debug = require('debug')

function A (f) {
  return function a (heart) {
    const as = []
    heart.call({ node: heart => { as.push(a(heart)) } }, a => as.push(a))
    return f(as)
  }
}

main()
function main () {
  const snabbdom = require('snabbdom')
  const h = snabbdom.h
  const h$ = (...args) => m.of(h(...args))
  const m = require('most')

  const VdomTree = A((vnode$s) => {
    if (vnode$s.some(x => !x || !x.source || !x.source.run)) {
      throw TypeError(VdomTree.toString())
    }
    const vnode$ = m.combineArray((...vnodes) => {
      const vnode = h('div.node', vnodes.map((x, i) => {
        if (x && typeof x.sel === 'string') {
          return Object.assign(x, {key: i})
        }
        return h('div.type-error', {key: i}, x + '')
      }))
      return vnode
    }, vnode$s)
    return vnode$
  })

  const heart = function heart (push, $, path) {
    const btn = n => h$('button', { on: { click: 'action' + n } }, [
      h('h1', 'Hi' + n)
    ])
    $.observe(debug(path))
    push(btn(path))
    this.node(function (push, $, path) {
      $.observe(debug(path))
      push(btn(path))
      this.node(function (push, $, path) {
        $.observe(debug(path))
        push(btn(path))
      })
    })
    this.node(function (push, $, path) {
      $.observe(debug(path))
      push(btn(path))
    })
  }
  const actionModule = require('../lib/drivers/snabbdom/actionModule')

  const vnode$ = VdomTree(
    addInputs(actionModule.action$,
      addPathToNodeInput(
        mapInputs(args => [
          ...args.slice(0, 2),
          args[2] ? '/' + args[2].join('/') : '/'
        ],
          heart
        )
      )
    )
  )

  SnabbdomRootNode(document.getElementById('root-node'), vnode$, [
    ...['class', 'props', 'style']
      .map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])

  function mapInputs (f, heart) {
    return function (...args) {
      heart.apply({
        node: heart => { this.node(mapInputs(f, heart)) }
      }, f(args))
    }
  }
  function addInputs (xs, heart) {
    return function (...args) {
      const node = (xs, heart) => { this.node(addInputs(xs, heart)) }
      heart.apply({node: node.bind(this, xs)}, args.concat(xs))
    }
  }
  function addPathToNodeInput (heart, path = []) {
    return function (...args) {
      const node = (heart, i) => {
        this.node(addPathToNodeInput(heart, [...path, i]))
      }
      var i = 0
      heart.apply({ node: heart => { node(heart, i++) } }, args.concat([path]))
    }
  }
}

function SnabbdomRootNode (elm, vnode$, modules) {
  const patch = require('snabbdom').init(modules)
  vnode$
    .tap(function () {
      var ident = ''
      const logVnode = vnode => {
        debug('patch')(ident + vnode.sel + '(' + (vnode.scopes ? vnode.scopes.toString() : '') + ')')
      }
      return function visitChildren (vnode) {
        logVnode(vnode)
        if (vnode.children) {
          ident = ident + '  '
          vnode.children.forEach(visitChildren)
          ident = ident.slice(-2)
        }
      }
    }())
    .tap(debug('patch'))
    .reduce(patch, elm)
  // const Nil = {
  //   toString () {
  //     return 'Nil'
  //   }
  // }
  // const Cons = (head, tail) => ({
  //   head,
  //   tail,
  //   toString () {
  //     return 'cons(' + this.head + ', ' + tail.toString() + ')'
  //   }
  // })
  // function isolateSink ($, scope) {
  //   return $.map(function mapVnode (vnode) {
  //     const scopes = vnode.scopes
  //     const children = vnode.children
  //     return Object.assign({}, vnode, {
  //       scopes: scopes ? Cons(scope, scopes) : Cons(scope, Nil),
  //       children: children ? children.map(mapVnode) : children
  //     })
  //   })
  // }
  //
  // function isolateSource ($, scope) {
  //   return $.filter(({vnode}) => vnode.scopes && vnode.scopes.head === scope)
  //     .tap(debug('isolateSource' + scope + ':'))
  //     .map((x) => Object.assign({}, x, {
  //       vnode: Object.assign({}, x.vnode, {
  //         scopes: x.vnode.scopes.tail
  //       })
  //     }))
  // }

  // function SnabbdomRootNode () {}
  //
  // const snabbdomnode = SnabbdomRootNode(elm, (data, children) => h('div', data, children), function (g, $) {
  //   g(snabbdomnode((data, children) => h('div', data, children), function (g, $) {
  //
  //   }))
  // })
  //
}
