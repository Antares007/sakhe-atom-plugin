const most = require('most')

var send
const action$ = new most.Stream({
  run (sink, scheduler) {
    send = (e) => scheduler.asap(most.PropagateTask.event(e, sink))
    return { dispose () { send = null } }
  }
}).multicast()
const createListener = () => {
  return function listener (event) {
    if (!send) return
    const vnode = listener.vnode
    const action = vnode.data.on[event.type]
    const e = { action, vnode, event }
    send(e)
  }
}
module.exports = {
  action$,
  create (emptyVnode, vnode) {
    const newOns = vnode.data.on
    if (!newOns) return
    const listener = vnode.listener = createListener()
    listener.vnode = vnode
    updateListners(listener, vnode.elm, {}, newOns)
  },
  update (oldVnode, vnode) {
    const oldOns = oldVnode.data.on
    const newOns = vnode.data.on
    if (!oldOns && !newOns) return
    const listener = vnode.listener = oldVnode.listener || createListener()
    listener.vnode = vnode
    updateListners(listener, vnode.elm, oldOns || {}, newOns || {})
  },
  destroy: (vnode) => {
    const oldOns = vnode.data.on
    if (!oldOns) return
    updateListners(vnode.listener, vnode.elm, oldOns, {})
  }
}

function updateListners (listener, elm, oldOns, newOns) {
  var name
  for (name in oldOns) {
    if (!newOns[name]) {
      elm.removeEventListener(name, listener, false)
    }
  }
  for (name in newOns) {
    if (!oldOns[name]) {
      elm.addEventListener(name, listener, false)
    }
  }
}
