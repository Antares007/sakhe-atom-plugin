const debug = require('debug')
const snabbdom = require('snabbdom')
const toVnode = require('snabbdom/tovnode').default

const ATree = require('./atree')

const promiseBark = ATree(ps => Promise.all(ps))

module.exports = (elm, pith) => logRing(debug('i'), patchRing(elm, addPathRay(['.'], pith)))

function patchRing (rootNode, pith) {
  return function patchRingPith () {
    pith.call(Object.assign({}, this, {
      put: (vnode$) => {
        const elm = document.createElement('div')
        const patch = snabbdom.init([])
        rootNode.appendChild(elm)
        this.put(
          vnode$
            .reduce(patch, toVnode(elm))
            .then(vnode => {
              rootNode.removeChild(vnode.elm)
              return vnode
            })
        )
      },
      node: (elm, pith) => {
        const parentElement = elm.parentElement
        this.node(function addArgPith (...args) {
          if (!parentElement) { rootNode.appendChild(elm) }
          this.put(
            promiseBark(patchRing(elm, pith)).then((rez) => {
              if (!parentElement) { elm.parentElement.removeChild(elm) }
              return rez
            })
          )
        })
      }
    }), {rootNode})
  }
}

function addPathRay (path, pith) {
  return function addPathRayPith (rays, ...rest) {
    var i = 0
    pith.call(Object.assign({}, this, {
      node: (x, pith) => this.node(x, addPathRay(path.concat(i++), pith))
    }), Object.assign({}, rays, { path: path.join('/') }), ...rest)
  }
}

function logRing (f, pith) {
  return function logRingPith (...args) {
    f(pith.name || pith.toString(), args)
    pith.apply(Object.assign({}, this, {
      node: (...args) => {
        f('n')
        this.node(...args.slice(0, -1), logRing(f, args[args.length - 1]))
      }
    }), args)
  }
}
