const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])
const toVnode = require('snabbdom/tovnode').default
const m = require('most')
const sh = require('snabbdom').h
// const ATree = require('./atree')

function hBark (cont$, pith) {
  return hInnerBark(cont$, addPathRay([0], (function map (pith) {
    const tag = path => ([sel, data, x]) => {
      data.path = path
      return [sel, data, x]
    }
    return function ({path}) {
      const $ = actionModule.action$.filter(x => x.vnode.data.path.startsWith(path))
      const action$ = a => $.filter(x => typeof a === 'function' ? a(x) : x.action === a)
      pith.call({
        l: (objs$) => this.l(objs$.map(tag(path))),
        n: (objs$, pith) => this.n(objs$.map(tag(path)), map(pith))
      }, {
        path,
        action$,
        $
      })
    }
  })(pith)))
}

function hInnerBark (cont$, pith) {
  const vnode$s = []
  pith.call({
    l: l$ => { vnode$s.push(l$.map(([sel, data, x]) => sh(sel, data, x))) },
    n: (cont$, pith) => { vnode$s.push(hInnerBark(cont$, pith)) }
  })
  return cont$.map(
    ([sel, data]) => children => sh(sel, data, children)
  ).ap(
    m.combineArray((...args) => args, vnode$s.map(vnode$ => vnode$))
  )
}

function Counter (d = 1) {
  return ({h, path, action$}) => {
    const sum$ = m.merge(action$(-1), action$(+1))
                  .scan((sum, x) => sum + x.action, 0)
    h('div', {}, sum$)
    h('button.i', {on: {click: +1}}, ({h, path}) => {
      h('span.p', {}, '+')
      if (d > 0) h('div', {}, Counter(d - 1))
    })
    h('button.d', {on: {click: -1}}, ({h, path}) => {
      h('span.m', {}, '-')
      if (d > 0) h('div', {}, Counter(d - 1))
    })
  }
}

const vnode$ = H('div#root-node.a', {}, Counter(3))

vnode$
  .tap(x => console.log(x))
  .reduce(patch, toVnode(document.getElementById('root-node')))

function H (sel, data, pith) {
  const cmb$ = (...args) => m.combineArray(
    (...array) => array,
    args.map(a => a.source ? a : m.of(a))
  )
  return hBark(cmb$(sel, data), (function map (pith) {
    return function (rays) {
      const l = (sel, data, x) => this.l(cmb$(sel, data, x))
      const n = (sel, data, pith) => this.n(cmb$(sel, data), map(pith))
      pith.call({l, n}, Object.assign({}, rays, {
        h: (sel, data, x) => typeof x === 'function' ? n(sel, data, x) : l(sel, data, x)
      }))
    }
  })(pith))
}

function addPathRay (path, pith) {
  return function addPathRayPith (rays) {
    var i = 0
    pith.call(Object.assign({}, this, {
      n: (x, pith) => this.n(x, addPathRay(path.concat(i++), pith))
    }), Object.assign({}, rays, { path: path.join('/') }))
  }
}
