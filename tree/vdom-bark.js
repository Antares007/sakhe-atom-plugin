const ATree = require('./atree')
const m = require('most')
const {h} = require('snabbdom')

const hf$Bark = (function Hf$Bark () {
  return function hf$Bark (hf$, pith) {
    const bark = ATree(
      hf$s => hf$
        .map(hf => hfs => h => {
          return hf((sel, data = {}) => h(sel, data, hfs.map(hf => hf(h))))
        }).ap(m.combineArray(
          (...hfs) => hfs,
          hf$s.map((hf$, key) => hf$.map(fh => h =>
            fh((s, d, c) => h(s, Object.assign({}, {key}, d), c))
          ))
        ))
    )
    return bark(function () {
      pith.call(Object.assign({}, this, {
        node: (hf$, pith) => this.put(hf$Bark(hf$, pith))
      }))
    })
  }
})()

module.exports = Object.assign(hf$Bark, {
  assignThis: f => mapPith(pith => function (rays) {
    pith.call(Object.assign({}, this, f(this)), rays)
  }),
  assignRays: f => mapPith(pith => function (rays) {
    pith.call(this, Object.assign({}, rays, f(rays)))
  }),
  mapPith
})

function mapPith (f) {
  return function rec (pith) {
    return f(function (...args) {
      pith.apply(Object.assign({}, this, {
        node: (hf$, pith) => this.node(hf$, rec(pith))
      }), args)
    })
  }
}
