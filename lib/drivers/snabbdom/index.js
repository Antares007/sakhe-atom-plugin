const debug = require('debug')
const most = require('most')
const snabbdom = require('snabbdom')
const tovnode = require('snabbdom/tovnode').default
const makeEventListenerModule = require('./makeEventListenerModule')
const makeDndModule = require('./makeDndModule')
const modules = [
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default
]

class SnabbdomSource extends most.Stream {
  constructor (action$) {
    super(action$.multicast().source)
  }

  isolateSource (source, scope) {
    return new SnabbdomSource(
      source.filter(
        ({vnode}) => vnode.scopes && vnode.scopes[0] === scope
      ).map(x => Object.assign({}, x, {
        vnode: Object.assign({}, x.vnode, {
          scopes: x.vnode.scopes.slice(1)
        })
      }))
    )
  }

  isolateSink (sink, scope) {
    return sink.map(function rec (vnode) {
      const ivnode = Object.assign({}, vnode, {
        scopes: vnode.scopes ? [scope, ...vnode.scopes] : [scope],
        children: vnode.children ? vnode.children.map(rec) : void 0
      })
      return ivnode
    })
  }
}

module.exports = function makeDomDriver (elm) {
  return function domDriver (vnode$) {
    const action$ = most.never().multicast()
    const {scheduler} = this
    const patch = snabbdom.init([
      ...modules,
      makeEventListenerModule(function () {
        return function listener (event) {
          const vnode = listener.vnode
          const action = vnode.data.on[event.type]
          const e = { action, vnode, event }
          action$.source.event(scheduler.now(), e)
        }
      }),
      makeDndModule(function listener (action, vnode, event) {
        const e = { action, vnode, event }
        action$.source.event(scheduler.now(), e)
      })
    ])

    vnode$
      .debounce(0)
      .tap(debug('snabbdom:sink'))
      .reduce(patch, tovnode(elm))

    return new SnabbdomSource(action$)
  }
}
