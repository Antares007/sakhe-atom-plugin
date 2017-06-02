const ATree = require('./atree')
const m = require('most')

module.exports = vnode$Bark

function vnode$Bark (path, $, vnode$, pith) {
  const tag = path => hf => h => {
    const vnode = hf((s, d, c) => {
      const vnode = h(s, d, c)
      vnode.path = path
      return vnode
    })
    return vnode
  }
  return vnode$InnerBark(vnode$,
    addPathRay(path,
      assignPith((ths, rays) => [{
        put: vnode$ => ths.put(vnode$.map(tag(rays.path))),
        node: (vnode$, pith) => ths.node(vnode$.map(tag(rays.path)), pith)
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

function vnode$InnerBark (vnode$, pith) {
  const bark = ATree(
    vnode$s => vnode$
      .map(hf => hfs => h => {
        return hf((sel, data = {}) => h(sel, data, hfs.map(hf => hf(h))))
      }).ap(m.combineArray(
        (...hfs) => hfs,
        vnode$s.map((vnode$, key) => vnode$.map(hf => h => {
          const vnode = hf.vnode = hf(h)
          vnode.key = key
          return vnode
        }))
      ))
  )
  return bark(function () {
    pith.call(Object.assign({}, this, {
      node: (vnode$, pith) => this.put(vnode$InnerBark(vnode$, pith))
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
        node: (vnode$, pith) => this.node(vnode$, rec(pith))
      }), args)
    })
  }
}
