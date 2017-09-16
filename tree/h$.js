const m = require('most')
const $ = require('./$')
const ATree = require('./atree')
const {h} = require('snabbdom')

const makeDeltac = (sel$, data$) =>
  vnode$s => m.combine(
    (sel, data, ...children) => h(sel, data, children),
    sel$, data$, ...vnode$s
  )

module.exports = H$

function H$ (sel, data, pith) {
  return $(pith)
    .map(pith => ATree(makeDeltac($(sel), $(data)), chainRing(pith)))
    .switchLatest()
}

function chainRing (pith) {
  return function (node, leaf) {
    pith(
      (sel, data, pith) => leaf(H$(sel, data, pith)),
      x => leaf($(x))
    )
  }
}
