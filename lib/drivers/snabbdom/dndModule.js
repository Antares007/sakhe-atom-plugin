const R = require('ramda')
const most = require('most')
const dispose = require('most/lib/disposable/dispose')
const {DragDropManager} = require('dnd-core')
const createBackend = require('react-dnd-html5-backend').default
const dndManager = new DragDropManager(createBackend)
const backend = dndManager.getBackend()
const registry = dndManager.getRegistry()

const makeHandler = (register, unregister, connect, events) =>
  (emit, itemType, elm) => {
    const handler = events.reduce(function (handler, name) {
      const ename = 'on' + name[0].toUpperCase() + name.slice(1)
      const rname = name + 'Result'
      handler[name] = (...args) => {
        const vnode = handler.vnode
        const dnd = vnode.data.dnd
        const action = dnd[ename]
        if (action) emit(action, vnode, args)
        return dnd[rname] || {}
      }
      return handler
    }, {})
    const id = register(itemType, handler)
    const disposable = dispose.all([
      dispose.create(() => unregister(id)),
      dispose.create(connect(id, elm))
    ])
    handler.dispose = disposable.dispose.bind(disposable)
    return handler
  }

const handlerTypes = {
  source: makeHandler(
    registry.addSource.bind(registry),
    registry.removeSource.bind(registry),
    backend.connectDragSource.bind(backend),
    ['canDrag', 'endDrag', 'beginDrag']
  ),
  target: makeHandler(
    registry.addTarget.bind(registry),
    registry.removeTarget.bind(registry),
    backend.connectDropTarget.bind(backend),
    ['canDrop', 'hover', 'drop']
  )
}

const HANDLER_SUFFIX = 'Handler'

var send
const action$ = new most.Stream({
  run (sink, scheduler) {
    send = (e) => scheduler.asap(most.PropagateTask.event(e, sink))
    return { dispose () { send = null } }
  }
}).multicast()
const emit = function listener (action, vnode, event) {
  const e = { action, vnode, event }
  send(e)
}
module.exports = {
  action$,
  create (emptyVnode, vnode) {
    const dnd = vnode.data.dnd
    if (!dnd) return
    for (var handlerType in handlerTypes) {
      const handlerName = handlerType + HANDLER_SUFFIX
      const itemType = dnd[handlerType]
      if (itemType) {
        const handler = handlerTypes[handlerType](emit, itemType, vnode.elm)
        handler.vnode = vnode
        dnd[handlerName] = handler
      }
    }
  },
  update (oldVnode, vnode) {
    const oldDnd = oldVnode.data.dnd
    const newDnd = vnode.data.dnd
    if (!oldDnd && !newDnd) return
    for (var handlerType in handlerTypes) {
      const handlerName = handlerType + HANDLER_SUFFIX
      const oldDndItemType = oldDnd && oldDnd[handlerType]
      const newDndItemType = newDnd && newDnd[handlerType]
      if (!oldDndItemType && !newDndItemType) return
      const same = R.equals(oldDndItemType, newDndItemType)
      if (oldDndItemType && !same) {
        oldDnd[handlerName].dispose()
      }
      const handler = same
        ? oldDnd[handlerName]
        : handlerTypes[handlerType](emit, newDndItemType, vnode.elm)
      handler.vnode = vnode
      newDnd[handlerName] = handler
    }
  },
  destroy (vnode) {
    const oldDnd = vnode.data.dnd
    if (!oldDnd) return
    for (var handlerType in handlerTypes) {
      const handlerName = handlerType + HANDLER_SUFFIX
      const handler = oldDnd[handlerName]
      if (handler) {
        handler.dispose()
      }
    }
  }
}
