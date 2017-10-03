const $ = require('../$')
const H$ = require('./h$')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const {async: subject} = require('most-subject')
const toVnode = require('snabbdom/tovnode').default
const {init} = require('snabbdom')
const createActionModule = require('../../lib/drivers/snabbdom/actionModule')
const defaultModules = ['class', 'props', 'style', 'attributes'].map(
  name => require('snabbdom/modules/' + name).default
)

const apiRing = pith => (elm, txt, vnode, action$, path) => {
  const h = (...args) => (
    args.length === 1
    ? txt($(args[0]).map(a => a + ''))
    : args.length === 2
    ? elm(apiRing)(args[0], {})(args[1])
    : args.length === 3
    ? elm(apiRing)(args[0], args[1])(args[2])
    : txt('h args error ' + JSON.stringify(args))
  )
  h.vnode = vnode
  h.$ = action$
  h.path = path
  pith(h)
}

const PatchBark = (pmap = apiRing) => (elm) => pith => {
  const rootVnode = toVnode(elm)
  const action$ = subject()
  const patchVnode = init([
    ...defaultModules,
    createActionModule(function (event) {
      const action = this.data.on[event.type]
      action$.next({ vnode: this, action, event })
    })
  ])
  const addActionRing = pith => (elm, txt, vnode, path) => {
    const element = (pmap = id) => elm(compose(addActionRing, pmap))
    pith(
      element,
      txt, vnode,
      action$.filter(x => x.vnode.data.path.endsWith(path)),
      path
    )
  }
  return H$(compose(addActionRing, pmap))(rootVnode.sel, rootVnode.data)(pith)
    .scan(patchVnode, rootVnode)
}

module.exports = PatchBark
