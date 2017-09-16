// const $ = require('./$')
const {Cons} = require('./list')

module.exports = function pathRing (path, pith) {
  return function (node, leaf) {
    var i = 0
    pith(
      (sel$, data$, pith$) => {
        const key = i++
        const thisPath = Cons(key, path)
        node(
          sel$,
          data$.map(data => Object.assign({path: thisPath, key}, data)),
          pith$.map(pith => pathRing(thisPath, pith))
        )
      },
      leaf,
      path
    )
  }
}
