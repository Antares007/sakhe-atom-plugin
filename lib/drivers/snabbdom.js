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
    const action$ = most.never().multicast()
    const emitEvent = action$.source.event.bind(action$.source)
    const patch = snabbdom.init([
      ...modules,
      require('./action')((action, vnode, event) => emitEvent(
          this.scheduler.now(),
          { action, vnode, event }
      ))
    ])
    vnode$.reduce(patch, tovnode(elm))
    return action$
  }
}
