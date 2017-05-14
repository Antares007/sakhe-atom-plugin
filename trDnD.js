const snabbdom = require('snabbdom')
const toVnode = require('snabbdom/tovnode').default
const h = window.h = snabbdom.h
const snabbdomPatch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default
])
let oldVnode = toVnode(document.getElementById('root-node'))
console.log(oldVnode)
const patch = window.patch = (vnode) => {
  oldVnode = snabbdomPatch(oldVnode, vnode)
}
const createBackend = window.createBackend = require('react-dnd-html5-backend').default
const dnd = window.dnd = require('dnd-core')
const dndManager = window.dndManager = new dnd.DragDropManager(createBackend)

patch(
  h('div', {
    style: {
      width: '100vw',
      height: '100vh'
    }
  }, [
    Knight(),
    Rectangle('target-a', 'red'),
    Rectangle('target-b', 'green'),
    Rectangle('target-c', 'blue')
  ])
)

const registry = window.registry = dndManager.getRegistry()
const s0 = window.s0 = registry.addSource('knight', {
  canDrag: (...args) => { console.log('Source.canDrag', args); return true },
  beginDrag: (...args) => { console.log('Source.beginDrag', args); return {a: 42} },
  endDrag: (monitor, type) => {
    console.log('Source.endDrag', { monitor, type, 'monitor.getDropResult()': monitor.getDropResult() })
    return {a: 43}
  }
})
const backend = window.backend = dndManager.getBackend()
const dispose = backend.connectDragSource(s0, document.getElementById('knight'))

const createTarget = (name) => registry.addTarget('knight', {
  canDrop: (...args) => {
    // console.log(name + '.canDrop', args);
    return true
  },
  hover: (...args) => {
    // console.log(name + '.hover', args);
    return {a: 1}
  },
  drop: (monitor, type) => {
    console.log(name + '.drop', {monitor, type, rez: monitor.getDropResult()})
    monitor.getDropResult()
    return {dropRezFrom: name}
  }
})
const ta = window.ta = createTarget('ta')
const tb = window.tb = createTarget('tb')
const disposeTa = backend.connectDropTarget(ta, document.getElementById('target-a'))
const disposeTb = backend.connectDropTarget(tb, document.getElementById('target-b'))

function Rectangle (id, color) {
  return h('div#' + id, {
    style: {
      height: '100px',
      backgroundColor: color
    }
  })
}

function Knight () {
  return h('div#knight', {
    style: {
      fontSize: '50px',
      fontWeight: 'bold',
      cursor: 'move',
      textAlign: 'center'
    }
  }, '♘')
}
