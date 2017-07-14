const ATree = require('./atree')
const m = require('most')

const {h} = require('snabbdom')
const {Cons, nil} = require('./list')
const actionModule = require('../lib/drivers/snabbdom/actionModule')
const deltac = (sel, data) => vnode$s => m.combineArray(function (sel, data, ...children) {
  return h(sel, data, children)
}, [$(sel), $(data), ...vnode$s])

module.exports = H$

function H$ (sel, data, pith) {
  const thisPath = data.path || nil
  return $(pith).map(pith => ATree(
    deltac(sel, Object.assign({}, data, {path: thisPath})),
    chainRing(pathRing(thisPath, apiRing(pith)))
  )).switchLatest()
}

function apiRing (pith) {
  return function (node, leaf, path) {
    const h = (a, b, c) => (
      typeof b === 'undefined' && typeof c === 'undefined'
      ? leaf(a)
      : node(a, b, c instanceof m.Stream ? c.map(apiRing) : apiRing(c))
    )
    h.path = path
    h.$ = action$(path).multicast()
    pith(h)
  }
}

function action$ (apath) {
  return actionModule
    .action$
    .filter(x => endsWith(x.vnode.data.path, apath))
  function endsWith (apath, path) {
    return (
      apath === path
        ? true
        : apath === nil
          ? false
          : endsWith(apath.tail, path)
    )
  }
}

function pathRing (path, pith) {
  var i = 0
  return function (node, leaf) {
    pith(
      (sel, data, pith) => {
        const thisPath = Cons(i++, path)
        node(sel, Object.assign({}, data, {path: thisPath}), (
          pith instanceof m.Stream
          ? pith.map(pith => pathRing(thisPath, pith))
          : pathRing(thisPath, pith)
        ))
      },
      leaf,
      path
    )
  }
}

function chainRing (pith) {
  return function (node, leaf) {
    pith(
      (sel, data, pith) => (
        pith instanceof m.Stream
        ? leaf(pith.map(pith => ATree(deltac(sel, data), chainRing(pith))).switchLatest())
        : node(deltac(sel, data), chainRing(pith))
      ),
      x => leaf($(x).map(x => x + ''))
    )
  }
}

function $ (x) {
  return (
    x instanceof m.Stream
    ? x
    : x && typeof x === 'object' && Object.keys(x).some(key => x[key] instanceof m.Stream)
    ? m.combineArray(function () {
      return Object.keys(x).reduce((s, key, i) => {
        s[key] = arguments[i]
        return s
      }, {})
    }, Object.keys(x).map(key => $(x[key])))
    : m.of(x)
  )
}
