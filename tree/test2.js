const vdomPatchRing = require('./snabbdom-bark2')
const m = require('most')
const {h} = require('snabbdom')

const ATree = require('./atree')
const promiseBark = ATree(ps => Promise.all(ps))
promiseBark(function () {
  this.put(Promise.resolve('hey'))
  this.node(
    vdomPatchRing(document.getElementById('root-node'),
      combineRing(
        function () {
          this.put(m.of(h('h1', 42)).merge(m.empty().delay(2000)))
          this.node(document.createElement('div'), function () {
            this.put(m.of(h('h2', 43)).merge(m.empty().delay(3000)))
          })
        }
      )
    )
  )
}).then((x) => console.log(x))

function Me (d = 6, w = 2) {
  return function mePith ({path, rootNode}) {
    const i$ = m.periodic(100).scan(c => c + 1, 0).map(i => i % 4 + 1)
    this.put(i$.map(i => h('h' + i, path)).until(m.of().delay((d + 1) * 1000)))
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        const elm = document.createElement('div')
        elm.setAttribute('id', 'node-' + path)
        elm.style.paddingLeft = '10px'
        this.node(elm, Me(d - 1, w))
      }
    }
  }
}

function combineRing (pith) {
  return pith
  const combineBark = ''
  return function p ({rootNode, path}) {
    pith.call(Object.assign({}, this, {
      put: vnode => {}
    }))
  }

  function logRing (f, pith) {
    return function logRingPith (...args) {
      f(pith.name || pith.toString(), args)
      pith.apply(Object.assign({}, this, {
        node: (...args) => {
          this.node(...args.slice(0, -1), logRing(f, args[args.length - 1]))
        }
      }), args)
    }
  }
}
