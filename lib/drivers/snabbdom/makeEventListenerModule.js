module.exports = function makeEventListenerModule (createListener) {
  return {
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
