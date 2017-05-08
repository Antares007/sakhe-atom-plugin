const most = require('most')
const snabbdom = require('snabbdom')
const tovnode = require('snabbdom/tovnode').default
const modules = [
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default
]

class SnabbdomSource extends most.Stream {
  constructor ($) {
    super($.multicast().source)
  }
  isolate (scope) {
    return new SnabbdomSource(
      this.filter(({vnode}) => vnode.scopes && vnode.scopes[0] === scope)
      .map((x) => Object.assign({}, x, {
        vnode: Object.assign({}, x.vnode, {
          scopes: x.vnode.scopes.slice(1)
        })
      }))
    )
  }
  isolateSink (scope, sink$) {
    return sink$.map(function mapVnode (vnode) {
      const scopes = vnode.scopes
      const children = vnode.children
      return Object.assign({}, vnode, {
        scopes: scopes ? [scope].concat(scopes) : [scope],
        children: children ? children.map(mapVnode) : children
      })
    }).multicast()
  }
}

module.exports = function makeDomDriver (elm) {
  return function domDriver (vnode$) {
    const hooksModule = require('./hooksModule')
    const actionModule = require('./actionModule')
    const dndModule = require('./dndModule')
    const action$ = actionModule.action$.merge(dndModule.action$)
    const patch = snabbdom.init([
      ...modules,
      actionModule,
      hooksModule,
      dndModule
    ])

    vnode$.reduce(patch, tovnode(elm))

    const parent = elm.parentElement
    this.dispose(() => {
      parent.removeChild(parent.children[0])
      parent.appendChild(elm)
    })
    return new SnabbdomSource(action$)
  }
}
