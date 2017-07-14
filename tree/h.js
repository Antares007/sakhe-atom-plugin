const ATree = require('./atree')
const {h} = require('snabbdom')
// const {nil} = require('./list')

module.exports = H

function H (sel, data, pith) {
  return ATree(
    vnodes => h(sel, data, vnodes),
    map(pith)
  )
}

function map (pith) {
  return function (node, leaf) {
    const mnode = (sel, data, pith) => node(vnodes => h(sel, data, vnodes), map(pith))
    const mleaf = x => leaf(x + '')
    pith(
      (a, b, c) => (
        typeof b === 'undefined' && typeof c === 'undefined'
        ? mleaf(a)
        : mnode(a, b, c)
      )
    )
  }
}
