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
          coercePutRay(
            coerceBarkRay(
              pith
            )
          )
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

function coercePutRay (pith) {
  return rays => pith(Object.assign({}, rays, {
    put: (...args) => {
      for (var i = 0; i < args.length; i++) {
        var a = args[i]
        rays.put(a.sel || typeof a === 'string' ? m.of(a) : a)
      }
    },
    bark: (vf$, pith) => rays.bark(vf$, coercePutRay(pith))
  }))
}
function coerceBarkRay (pith) {
  return rays => pith(Object.assign({}, rays, {
    bark: (x, pith) => rays.bark(
      x.sel
      ? m.of(children => Object.assign({}, x, {children}))
      : x,
      coerceBarkRay(pith)
    )
  }))
}
function addActionSource ($, pith) {
  return rays => pith(Object.assign({}, rays, {
    put: vdom$ => rays.put(vdom$.map(function mapVnode (n) {
      return n && n.sel
      ? Object.assign({}, n, {
        path: rays.path,
        children: n.children ? n.children.map(mapVnode) : n.children
      })
      : n
    })),
    bark: (viewFn$, pith) => rays.bark(
      viewFn$.map(vf => chlds => Object.assign({}, vf(chlds), {path: rays.path})),
      addActionSource($, pith)
    ),
    $: $.filter(x => x.vnode.path.startsWith(rays.path))
  }))
}
function addPathRay (pith, path = ['']) {
  return function (rays) {
    var i = 0
    pith(Object.assign({}, rays, {
      bark: (viewFn$, pith) => rays.bark(viewFn$, addPathRay(pith, path.concat(i++))),
      path: path.join('/')
    }))
  }
}
