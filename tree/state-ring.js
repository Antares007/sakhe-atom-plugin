module.exports = function stateRing (initState, pith) {
  return function (node, leaf, path) {
    pith(
      (sel, data, pith) => node(sel, data, pith),
      x => leaf(x),
      path
    )
  }
}
