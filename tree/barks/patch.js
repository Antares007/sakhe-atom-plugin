const vnodeBark = require('./vnode')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const {async: subject} = require('most-subject')
const toVnode = require('snabbdom/tovnode').default
const {init} = require('snabbdom')
const createActionModule = require('../../lib/drivers/snabbdom/actionModule')
const defaultModules = ['class', 'props', 'style', 'attributes'].map(
  name => require('snabbdom/modules/' + name).default
)

const PatchBark = (pmap = require('../rings/api')) => (elm) => pith => {
  const rootVnode = toVnode(elm)
  const action$ = subject()
  const patchVnode = init([
    ...defaultModules,
    createActionModule(function (event) {
      const action = this.data.on[event.type]
      action$.next({ vnode: this, action, event })
    })
  ])
  const addActionRing = pith => (put, select) => {
    pith(Object.assign({}, put, {
      node: (pmap = id) => put.node(p => addActionRing(pmap(p)))
    }), Object.assign({}, select, {
      action$: action$.filter(x => x.vnode.data.path.endsWith(select.path))
    }))
  }
  return vnodeBark(compose(addActionRing, pmap))(rootVnode.sel, rootVnode.data)(pith)
    .scan(patchVnode, rootVnode)
    .skip(1)
}

module.exports = PatchBark
