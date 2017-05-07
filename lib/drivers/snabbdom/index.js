const debug = require('debug')
const most = require('most')
const snabbdom = require('snabbdom')
const tovnode = require('snabbdom/tovnode').default
const modules = [
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default
]

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

    vnode$
      .tap(debug('snabbdom:sink'))
      .reduce(patch, tovnode(elm))

    class SnabbdomSource extends most.Stream {
      constructor ($, namespace = []) {
        super($.multicast().source)
        this.namespace = namespace
      }

      isolate (scope) {
        const namespace = this.namespace.concat(scope)
        const $ = action$.filter(({vnode}) =>
          vnode.scopes && vnode.scopes.some(x => arrayEquals(x, namespace))
        )
        return new SnabbdomSource($, namespace)
      }

      isolateSink (sink$) {
        const namespace = this.namespace
        return sink$.map(function mapVnode (vnode) {
          const scopes = vnode.scopes
          const children = vnode.children
          return Object.assign({}, vnode, {
            scopes: scopes ? scopes.concat([namespace]) : [namespace],
            children: children ? children.map(mapVnode) : children
          })
        }).multicast()
      }
    }
    const parent = elm.parentElement
    this.dispose(() => {
      parent.removeChild(parent.children[0])
      parent.appendChild(elm)
    })
    return new SnabbdomSource(action$)
  }
}

function arrayEquals (a, b) {
  const alength = a.length
  if (alength !== b.length) return false
  for (var i = 0; i < alength; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
