const hf$bark = require('./vdom-bark')
const m = require('most')
const {h} = require('snabbdom')

const cring = hf$bark.assignThis(ths => {
  const coerce = x => typeof x === 'function' ? m.of(x) : x
  return {
    node: (x, pith) => ths.node(coerce(x), pith),
    put: (x, data = {}) => ths.put(coerce(x))
  }
})
const addAction$Ray = hf$bark.assignRays(rays => ({
  action$: a => rays.$.filter(x => {
    if (typeof a === 'function') return a(x)
    return x.action === a
  })
}))

module.exports = function ring (path, $, pith) {
  const add$Ray = hf$bark.assignRays(rays => ({
    $: $.filter(({vnode: {data: {path}}}) => path.startsWith(rays.path))
  }))
  const addNode$ = hf$bark.mapPith(pith => function (rays) {
    var i = 0
    pith.call(Object.assign({}, this, {
      node$: (hf$, pith$) => this.put(
        pith$.map(pith =>
          hf$bark(hf$, ring(rays.path.split('/').concat('$' + i++), rays.$, pith))
            .map(hf => () => hf(h))
        ).switchLatest()
      )
    }), rays)
  })
  return (
    addPathRay(path,
      pathTagVnodes(
        add$Ray(
          addAction$Ray(
            addNode$(cring(pith)
            )
          )
        )
      )
    )
  )
}

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
