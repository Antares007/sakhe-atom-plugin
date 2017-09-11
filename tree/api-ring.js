const $ = require('./$')

module.exports = action$ => function apiRing (pith) {
  return function (node, leaf, path) {
    const h = (sel, data, pith) => (
      typeof data === 'undefined' && typeof pith === 'undefined'
      ? leaf(sel)
      : typeof data !== 'undefined' && typeof pith === 'undefined'
      ? node(sel, {}, $(data).map(apiRing))
      : node(sel, data, $(pith).map(apiRing))
    )
    h.path = path
    h.$ = action$
      .filter(x => x.vnode.data.path.endsWith(path))
      .multicast()
    pith(h)
  }
}
