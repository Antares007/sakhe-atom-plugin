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
    deltac(sel, $(data).map(data => Object.assign({path: thisPath}, data))),
    chainRing(pathRing(thisPath, apiRing(pith)))
  )).switchLatest()
}

function apiRing (pith) {
  return function (node, leaf, path) {
    const h = (sel, data, pith) => (
      typeof data === 'undefined' && typeof pith === 'undefined'
      ? leaf(sel)
      : typeof data !== 'undefined' && typeof pith === 'undefined'
      ? node(sel, {}, $(data).map(apiRing))
      : node(sel, data, $(pith).map(apiRing))
    )
    h.path = path
    h.$ = actionModule.action$
      .filter(x => x.vnode.data.path.endsWith(path))
      .multicast()
    pith(h)
  }
}

function pathRing (path, pith) {
  var i = 0
  return function (node, leaf) {
    pith(
      (sel, data, pith) => {
        const key = i++
        const thisPath = Cons(key, path)
        node(
          sel,
          $(data).map(data => Object.assign({path: thisPath, key}, data)),
          $(pith).map(pith => pathRing(thisPath, pith))
        )
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
      x => leaf($(x))
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
