const ATree = require('./atree')
const m = require('most')
const setIndex = vdom$s => vdom$s.map(
  (vdom$, i) => vdom$.map(
    x => x && x.sel
    ? Object.assign({}, x, { key: i })
    : {sel: 'div', key: i, data: {}, text: x + ''}
  )
)
const vnodeBark = function vnodeBark (viewFn$, pith) {
  const bark = ATree(
    vdom$s => viewFn$.ap(m.combineArray(
      (...vdoms) => vdoms,
      setIndex(vdom$s)
    ))
  )
  return bark(({put, bark}) => pith({
    put,
    bark: (viewFn$, pith) => put(vnodeBark(viewFn$, pith))
  }))
}

module.exports = vnodeBark
