const debug = require('debug')
const most = require('most')
const snabbdom = require('snabbdom')
const tovnode = require('snabbdom/tovnode').default
const modules = [
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default
]

const scopes = new Map()

class SnabbdomSource extends most.Stream {
  constructor ($, namespace = []) {
    super($.multicast().source)
    this.namespace = namespace
  }

  isolate (scope) {
    const namespace = this.namespace.concat(scope)
    const $ = this.filter(({vnode}) =>
      scopes.has(vnode) &&
      scopes.get(vnode).some(x => arrayEquals(x, namespace))
    )
    return new SnabbdomSource($, namespace)
  }

  isolateSink (sink$) {
    const namespace = this.namespace
    return sink$.tap(function tapVnode (vnode) {
      if (!vnode.data || !vnode.data.on) return
      scopes.set(vnode, scopes.has(vnode)
        ? scopes.get(vnode).concat(namespace)
        : [namespace])
      if (vnode.children) {
        vnode.children.forEach(tapVnode)
      }
    }).multicast()
  }
}

module.exports = function makeDomDriver (elm) {
  return function domDriver (vnode$) {
    const hooksModule = require('./hooksModule')
    const actionModule = require('./actionModule')
    const dndModule = require('./dndModule')
    const action$ = actionModule.action$.merge(dndModule.action$)
    const parent = elm.parentElement
    const patch = snabbdom.init([
      ...modules,
      actionModule,
      hooksModule,
      dndModule
    ])

    vnode$
      .tap(debug('snabbdom:sink'))
      .reduce(patch, tovnode(elm))

    return Object.assign(new SnabbdomSource(action$), {
      dispose: () => {
        parent.removeChild(parent.children[0])
        parent.appendChild(elm)
      }
    })
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
