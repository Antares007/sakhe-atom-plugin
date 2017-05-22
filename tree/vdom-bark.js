const ATree = require('./atree')
const m = require('most')

const hf$Bark = function hf$Bark (hf$, pith) {
  const bark = ATree(
    hf$s => hf$
      .map(hf => hfs => h => hf((sel, data) => h(sel, data, hfs.map(hf => hf(h)))))
      .ap(m.combineArray(
        (...hfs) => hfs,
        hf$s.map((hf$, key) => hf$.map(fh => h => fh((s, d, c) => h(s, Object.assign({}, {key}, d), c))))
      ))
  )
  return bark(function () {
    pith.call(Object.assign({}, this, {
      node: (hf$, pith) => this.put(hf$Bark(hf$, pith))
    }))
  })
}

module.exports = (path, hf$, pith) =>
  hf$Bark(hf$, addPathRay(path, pathTagVnodes(pith)))

module.exports.assignThis = f => mapPith(pith => function (rays) {
  pith.call(Object.assign({}, this, f(this)), rays)
})

module.exports.assignRays = f => mapPith(pith => function (rays) {
  pith.call(this, Object.assign({}, rays, f(rays)))
})

module.exports.mapPith = mapPith

function addPathRay (path, pith) {
  return function () {
    var i = 0
    pith.call(Object.assign({}, this, {
      node: (hf$, pith) => this.node(hf$, addPathRay(path.concat(i++), pith))
    }), { path: path.join('/') })
  }
}

function pathTagVnodes (pith) {
  return function (rays) {
    const addPath = hf => h =>
      hf((s, d, c) => h(s, Object.assign({}, d, {path: rays.path}), c))
    pith.call(Object.assign({}, this, {
      put: hf$ => this.put(hf$.map(addPath)),
      node: (hf$, pith) => this.node(hf$.map(addPath), pathTagVnodes(pith))
    }), rays)
  }
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
