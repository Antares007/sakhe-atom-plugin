const debug = require('debug')
const most = require('most')
const snabbdom = require('snabbdom')
const tovnode = require('snabbdom/tovnode').default
const makeEventListenerModule = require('./makeEventListenerModule')
const modules = [
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default
]
module.exports = function makeDomDriver (elm) {
  return function domDriver (vnode$) {
    const action$ = most.never().multicast()
    const {scheduler} = this
    const {PropagateTask} = most

    const patch = snabbdom.init([
      ...modules,
      makeEventListenerModule(function () {
        return function listener (event) {
          const vnode = listener.vnode
          const action = vnode.data.on[event.type]
          scheduler.asap(
            PropagateTask.event({ action, vnode, event }, action$.source)
          )
        }
      })
    ])

    vnode$
      .debounce(0)
      .tap(debug('snabbdom:sink'))
      .reduce(patch, tovnode(elm))

    action$.h = {h: snabbdom.h}
    action$.isolateSink = isolateSink
    action$.isolateSource = isolateSource

    return action$
  }
}

function isolateSink (sink, scope) {
  return sink.map(function rec (vnode) {
    const ivnode = Object.assign({}, vnode, {
      scopes: vnode.scopes ? [...vnode.scopes, scope] : [scope],
      children: vnode.children ? vnode.children.map(rec) : void 0
    })
    return ivnode
  })
}

function isolateSource (source, scope) {
  const s = source.filter(
    ({vnode}) => {
      return vnode.scopes && vnode.scopes.indexOf(scope) >= 0
    }
  )
  s.isolateSink = isolateSink
  s.isolateSource = isolateSource
  return s
}
