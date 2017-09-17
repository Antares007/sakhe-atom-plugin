module.exports = function stateRing (initState, pith) {
  return function (node, leaf, path) {
    console.log(initState, path.toString())
    pith(
      (sel$, data$, pith$) => node(
        sel$,
        data$,
        pith$.map(pith => stateRing(initState + 1, pith))
      ),
      v$ => leaf(v$),
      path
    )
  }
}
