const ATree = require('./atree')
const {Cons, nil} = require('./list')
const H = require('./vnode-bark')

module.exports = renderBark

function renderBark (rootNode, pith, path = nil) {
  return ATree(
    as => as,
    f => (sel, data, pith) => f(H(sel, data, pith)),
    push => {
      push.path = path
      pith(push)
    }
  )
}
