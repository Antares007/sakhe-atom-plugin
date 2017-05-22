const m = require('most')
const snabbdom = require('snabbdom')
const {h} = snabbdom
const vdomBark = require('./vdom-bark')

module.exports = function snabbdomBark (elm, pith) {
  const actionModule = require('../lib/drivers/snabbdom/actionModule')

  const vnode$ =
    vdomBark(['.'], m.of(h => h('div#root-node', {})),
      vdomBark.assignRays(rays => ({
        $: actionModule.action$.filter(({vnode: {data: {path}}}) => path.startsWith(rays.path))
      }))(
        pith
      )
    ).map(hf => hf(h))

  const patch = snabbdom.init([
    ...['class', 'props', 'style'].map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])
  vnode$
    // .tap(debug('patch'))
    .reduce(patch, elm)
}
