const m = require('most')
const snabbdom = require('snabbdom')
const {h} = snabbdom
const vdomBark = require('./vdom-bark')

module.exports = function snabbdomBark (elm, pith) {
  const actionModule = require('../lib/drivers/snabbdom/actionModule')

  const vnode$ =
    vdomBark(m.of(children => h('div#root-node', children)),
      addPathRay(
        addActionSource(actionModule.action$,
          pith
        )
      )
    )

  const patch = snabbdom.init([
    ...['class', 'props', 'style'].map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])
  vnode$
    // .tap(debug('patch'))
    .reduce(patch, elm)
}

function addActionSource ($, pith) {
  return function (rays, ...rest) {
    pith.apply(Object.assign({}, this, {
      put: vdom$ => this.put(vdom$.map(function mapVnode (n) {
        return n && n.sel
        ? Object.assign({}, n, {
          path: rays.path,
          children: n.children ? n.children.map(mapVnode) : n.children
        })
        : n
      })),
      node: (viewFn$, pith) => this.node(
        viewFn$.map(vf => chlds => Object.assign({}, vf(chlds), {path: rays.path})),
        addActionSource($, pith)
      )
    }), [
      Object.assign({}, rays, {
        $: $.filter(x => x.vnode.path.startsWith(rays.path))
      }),
      ...rest
    ])
  }
}

function addPathRay (pith, path = ['pith']) {
  return function (rays, ...rest) {
    var i = 0
    pith.apply(Object.assign({}, this, {
      node: (viewFn$, pith) => this.node(viewFn$, addPathRay(pith, path.concat(i++)))
    }), [
      Object.assign({}, rays, { path: path.join('/') }),
      ...rest
    ])
  }
}
