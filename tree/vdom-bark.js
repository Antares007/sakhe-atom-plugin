const ATree = require('./atree')
const m = require('most')

const setKey = (vnode, i) => Object.assign({}, vnode, { key: i })

const vnodeBark = function vnodeBark (viewFn$, pith) {
  const bark = ATree(
    vdom$s => viewFn$.ap(m.combineArray((...vdoms) => vdoms.map(setKey), vdom$s))
  )
  return bark((push, bark) => pith(
    push,
    (viewFn$, pith) => push(vnodeBark(viewFn$, pith)))
  )
}

module.exports = vnodeBark
