module.exports = function eventListenersModule (invokeHandler) {
  function handleEvent (event, vnode) {
    var name = event.type
    var on = vnode.data.on
      // call event handler(s) if exists
    if (on && on[name]) {
      invokeHandler(on[name], vnode, event)
    }
  }
  function createListener () {
    return function handler (event) {
      handleEvent(event, handler.vnode)
    }
  }
  function updateEventListeners (oldVnode, vnode) {
    var oldOn = oldVnode.data.on
    var oldListener = oldVnode.listener
    var oldElm = oldVnode.elm
    var on = vnode && vnode.data.on
    var elm = vnode && vnode.elm
    var name
    if (oldOn === on) return
    if (oldOn && oldListener) {
      if (!on) {
        for (name in oldOn) {
          oldElm.removeEventListener(name, oldListener, false)
        }
      } else {
        for (name in oldOn) {
          if (!on[name]) {
            oldElm.removeEventListener(name, oldListener, false)
          }
        }
      }
    }
    if (on) {
      var listener = vnode.listener = oldVnode.listener || createListener()
      listener.vnode = vnode
      if (!oldOn) {
        for (name in on) {
          elm.addEventListener(name, listener, false)
        }
      } else {
        for (name in on) {
          if (!oldOn[name]) {
            elm.addEventListener(name, listener, false)
          }
        }
      }
    }
  }
  return {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners
  }
}
