
const m = require('most')
const sh = require('snabbdom').h
const animationFrame$ = require('./animation-frame')

module.exports = H

function H (sel, data, pith) {
  return Hinner(sel, data, (function map (pith) {
    return function (rays) {
      const l = (sel, data, x) => this.l(sel, data, x)
      const n = (sel, data, pith) => this.n(sel, data, map(pith))
      pith.call({}, Object.assign({}, rays, {
        h: (sel, x, y) => {
          const keys = Object.keys(x)
          const data$ = (
            x && x.source
            ? x
            : keys.length === 0
            ? m.of({})
            : m.combineArray(
              (...values) => values.reduce((data, value, i) => {
                data[keys[i]] = value
                return data
              }, {}),
              keys.map(key => x[key] && x[key].source ? x[key] : m.of(x[key]))
            )
          )
          return typeof y === 'function' ? n(sel, data$, y) : l(sel, data$, y)
        },
        animationFrame$
      }))
    }
  })(pith))
}

function Hinner (sel, data, pith) {
  const cmb$ = (...args) => m.combineArray(
    (...array) => array,
    args.map(a => a && a.source ? a : m.of(a))
  )
  return hBark(cmb$(sel, data), (function map (pith) {
    return function (rays) {
      const l = (sel, data, x) => this.l(cmb$(sel, data, x))
      const n = (sel, data, pith) => this.n(cmb$(sel, data), map(pith))
      pith.call({l, n}, rays)
    }
  })(pith))
}

function hBark (cont$, pith) {
  const actionModule = require('../lib/drivers/snabbdom/actionModule')
  const patch = require('snabbdom').init([
    ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])
  const toVnode = require('snabbdom/tovnode').default
  const tag = path => ([sel, data, x]) => {
    data.path = path
    return [sel, data, x]
  }
  return hInnerBark(cont$, addPathRay([0], (function map (pith) {
    return function ({path}) {
      const $ = actionModule.action$.filter(x => x.vnode.data.path.startsWith(path))
      const action$ = a => $.filter(x => typeof a === 'function' ? a(x) : x.action === a)
      pith.call({
        l: (objs$) => this.l(objs$.map(tag(path))),
        n: (objs$, pith) => this.n(objs$.map(tag(path)), map(pith))
      }, { path, action$, $ })
    }
  }(pith))))
    // .tap(x => console.log(x))
    .reduce(patch, toVnode(document.getElementById('root-node')))

  function hInnerBark (cont$, pith) {
    const vnode$s = []
    pith.call({
      l: l$ => { vnode$s.push(l$.map(([sel, data, x]) => sh(sel, data, x))) },
      n: (cont$, pith) => { vnode$s.push(hInnerBark(cont$, pith)) }
    })
    return cont$.map(
      ([sel, data]) => children => sh(sel, data, children)
    ).ap(
      m.combineArray(
        (...args) => args,
        vnode$s.map((vnode$, key) => vnode$.map(vnode => Object.assign({}, vnode, {key})))
      )
    )
  }
}

function addPathRay (path, pith) {
  return function addPathRayPith (rays) {
    var i = 0
    pith.call(Object.assign({}, this, {
      n: (x, pith) => this.n(x, addPathRay(path.concat(i++), pith))
    }), Object.assign({}, rays, { path: path.join('/') }))
  }
}
