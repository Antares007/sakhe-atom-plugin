const ATree = require('./atree')
const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])
const toVnode = require('snabbdom/tovnode').default
const m = require('most')

module.exports = SnabbdomBark

function SnabbdomBark (rootElm, pith) {
  const rootVNode = toVnode(rootElm)
  return ATree(vnode$s => m.combineArray(
    (...children) => Object.assign({}, rootVNode, {children}),
    vnode$s
  ))(pith).reduce(patch, rootVNode)
}
