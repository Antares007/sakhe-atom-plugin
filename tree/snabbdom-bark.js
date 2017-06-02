const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])
const toVnode = require('snabbdom/tovnode').default
const m = require('most')
const {h} = require('snabbdom')
const promiseBark = require('./atree')(ps => Promise.all(ps))
var rootId = 0

module.exports = snabbdomBark

function snabbdomBark (rootNode, pith) {
  const vnode$ = hf$Bark(m.of(h => h('div', {}, pith)))
  return vnode$
    .reduce(patch, toVnode(rootNode))
}

function snabbdomBark (rootNode, pith) {
  return snabbdomInnerBark(rootNode,
    addPathRay([rootId++],
      assignPith((ths, rays) => [{
        put: hf$ => ths.put(
          hf$.flatMap(hf => {
            const piths = []
            const vnode = hf((s, d, c) => {
              if (typeof c === 'function') {
                c = [c]
                piths.push(c)
              }
              const vnode = h(s, d, c)
              vnode.path = rays.path
              return vnode
            })
            if (piths.length === 0) return m.of(vnode)
            return vnode
          })
        )
      }, {
        $: actionModule.action$.filter(x => x.vnode.path.startsWith(rays.path))
      }])(
        pith
      )
    )
  )
}

function snabbdomInnerBark (rootNode, pith) {
  return promiseBark(function () {
    pith.call({
      put: (vnode$) => {
        const elm = document.createElement('div')
        rootNode.appendChild(elm)
        this.put(
          vnode$
            .reduce(patch, toVnode(elm))
            .then(vnode => { rootNode.removeChild(vnode.elm); return vnode })
        )
      },
      node: (elm, pith) => {
        const parentElement = elm.parentElement
        this.node(function nodePith (...args) {
          if (!parentElement) { rootNode.appendChild(elm) }
          this.put(
            snabbdomInnerBark(elm, pith).then((rez) => {
              if (!parentElement) { elm.parentElement.removeChild(elm) }
              return rez
            })
          )
        })
      }
    }, {rootNode})
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

// function assignThis (f) {
//   return mapPith(pith => function (rays) {
//     pith.call(Object.assign({}, this, f(this, rays)), rays)
//   })
// }
//
// function assignRays (f) {
//   return mapPith(pith => function (rays) {
//     pith.call(this, Object.assign({}, rays, f(rays, this)))
//   })
// }

// function logRing (f, pith) {
//   return function logRingPith (...args) {
//     f(pith.name || pith.toString(), args)
//     pith.apply(Object.assign({}, this, {
//       node: (...args) => {
//         f('n')
//         this.node(...args.slice(0, -1), logRing(f, args[args.length - 1]))
//       }
//     }), args)
//   }
// }
