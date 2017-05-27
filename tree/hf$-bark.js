const ATree = require('./atree')
const m = require('most')
var nodeId = 0
module.exports = hf$Bark

function hf$Bark (path, $, hf$, pith) {
  const tag = path => hf => h => {
    const vnode = hf((s, d, c) => {
      const vnode = h(s, d, c)
      vnode.path = path
      return vnode
    })
    return vnode
  }
  return hf$InnerBark(hf$,
    addPathRay(path.concat(nodeId++),
      assignPith((ths, rays) => [{
        put: hf$ => ths.put(hf$.map(tag(rays.path))),
        node: (hf$, pith) => ths.node(hf$.map(tag(rays.path)), pith)
      }, {
        $: $.filter(x => x.vnode.path.startsWith(rays.path)),
        action$: a => $.filter(x => x.vnode.path.startsWith(rays.path)).filter(x => {
          if (typeof a === 'function') return a(x)
          return x.action === a
        })
      }])(
        pith
      )
    )
  )
}

function hf$InnerBark (hf$, pith) {
  const bark = ATree(
    hf$s => hf$
      .map(hf => hfs => h => {
        return hf((sel, data = {}) => h(sel, data, hfs.map(hf => hf(h))))
      }).ap(m.combineArray(
        (...hfs) => hfs,
        hf$s.map((hf$, key) => hf$.map(hf => h => {
          const vnode = hf(h)
          vnode.key = key
          return vnode
        }))
      ))
  )
  return bark(function () {
    pith.call(Object.assign({}, this, {
      node: (hf$, pith) => this.put(hf$InnerBark(hf$, pith))
    }))
  })
}

function addPathRay (path, pith) {
  return function addPathRayPith (rays) {
    var i = 0
    pith.call(Object.assign({}, this, {
      node: (x, pith) => this.node(x, addPathRay(path.concat(i++), pith))
    }), Object.assign({}, rays, { path: path.join('/') }))
  }
}

function assignPith (f) {
  return mapPith(pith => function (rays) {
    const [athis, arays] = f(this, rays)
    pith.call(
      Object.assign({}, this, athis),
      Object.assign({}, rays, arays)
    )
  })
}

function mapPith (f) {
  return function rec (pith) {
    return f(function (...args) {
      pith.apply(Object.assign({}, this, {
        node: (hf$, pith) => this.node(hf$, rec(pith))
      }), args)
    })
  }
}
