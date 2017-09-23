const m = require('most')
const $ = require('./$')
const ATree$ = require('./atree$')
const {h} = require('snabbdom')
const {Cons, nil} = require('./list')

module.exports = createH$

function createH$ (action$, path = nil) {
  const apiRing = (action$, pith) => $(pith).map(pith => function (node, leaf, path) {
    const h = (...args) => (
      args.length === 3
      ? node($(args[0]), $(args[1]), apiRing(action$, args[2]))
      : args.length === 2
      ? node($(args[0]), $({}), apiRing(action$, args[1]))
      : args.length === 1
      ? leaf($(args[0]))
      : leaf($(`h arguments error [${JSON.stringify(args)}]`))
    )
    h.path = path
    h.$ = action$
      .filter(x => x.vnode.data.path.endsWith(path))
      .multicast()
    pith(h)
  })

  const pathRing = (path, pith) => $(pith).map(pith => function (node, leaf) {
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

  const makeDeltac = (sel, data) => m.combine(
    (s, d) => vnode$s => m.combineArray((...chlds) => h(s, d, chlds), vnode$s),
    $(sel),
    $(data)
  )
  const chainRing = pith => $(pith).map(pith => function (node, leaf) {
    pith(
      (sel, data, pith) => node(makeDeltac(sel, data), chainRing(pith)),
      x => leaf($(x))
    )
  })

  return (sel, data, pith) => ATree$(
    makeDeltac(sel, data),
    chainRing(pathRing(path, apiRing(action$, pith)))
  )
}