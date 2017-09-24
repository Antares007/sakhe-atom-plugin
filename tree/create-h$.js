const m = require('most')
const $ = require('./$')
const ATree = require('./atree')
const {h} = require('snabbdom')
const {Cons, nil} = require('./list')

module.exports = createH$

function apiRing (action$, pith) {
  return $(pith).map(pith => function apiPith (node, leaf, path) {
    const h = (...args) => (
      args.length === 3
      ? node($(args[0]), $(args[1]), apiRing(action$, args[2]))
      : args.length === 2
      ? node($(args[0]), $({}), apiRing(action$, args[1]))
      : args.length === 1
      ? leaf($(args[0]))
      : leaf($(`h arguments error ${JSON.stringify(args)}`))
    )
    h.path = path
    h.$ = action$
      .filter(x => x.vnode.data.path.endsWith(path))
      .multicast()
    pith(h)
  })
}

function pathRing (path, pith) {
  return $(pith).map(pith => function pathPith (node, leaf) {
    var i = 0
    pith(
      (sel, data, pith) => {
        const key = i++
        const thisPath = Cons(key, path)
        node(
          sel,
          $(data).map(data => Object.assign({path: thisPath, key}, data)),
          pathRing(thisPath, pith)
        )
      },
      leaf,
      path
    )
  })
}

function chainRing (pith) {
  return function chainPith (node, leaf) {
    pith(
      (sel, data, pith) => leaf(bark(sel, data, pith)),
      a => leaf($(a))
    )
  }
}

function bark (sel, data, pith) {
  return $(pith).map(pith => ATree(
    vnode$s => m.combine((s, d, ...chlds) => h(s, d, chlds), $(sel), $(data), ...vnode$s),
    chainRing(pith)
  )).switchLatest()
}

function createH$ (action$, path = nil) {
  return (sel, data, pith) => bark(sel, data, pathRing(path, apiRing(action$, pith)))
}
