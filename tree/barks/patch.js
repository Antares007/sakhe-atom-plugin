const $ = require('../$')
const H$ = require('./h$')
const {ReducerBark} = require('./state')
const id = a => a
// const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const {async: subject} = require('most-subject')
const toVnode = require('snabbdom/tovnode').default
const {init} = require('snabbdom')
const createActionModule = require('../../lib/drivers/snabbdom/actionModule')
const defaultModules = ['class', 'props', 'style', 'attributes'].map(
  name => require('snabbdom/modules/' + name).default
)

const PatchBark = (pmap = id) => (elm) => ReducerBark(pith =>
  (obj, arr, val, select) => {
    const rootVnode = toVnode(elm)
    const action$ = subject()
    const patchVnode = init([
      ...defaultModules,
      createActionModule(function (event) {
        const action = this.data.on[event.type]
        action$.next({ vnode: this, action, event })
      })
    ])
    select('vnode$s')
      .filter(vnode$s => vnode$s.length)
      .map(vnode$s => H$()(rootVnode.sel, rootVnode.data)((e, t, v) => {
        vnode$s.forEach(vnode$ => v(vnode$))
      }))
      .switchLatest()
      .until(select('end').filter(Boolean).take(1))
      .tap(x => x.log())
      .reduce(patchVnode, rootVnode)
      .then(vnode => patchVnode(vnode, rootVnode))

    var i = 0
    const patch = vnode$ => arr()('vnode$s')((o, a, v) => v(i++, s => vnode$))
    const end = e => val('end', $(e).constant(s => true))
    pmap(pith)(patch, end, action$)
  }
)()

module.exports = PatchBark

PatchBark()(document.getElementById('root-node'))((patch, end, action$) => {
  patch(
    H$()('div.a')((elm, txt, vnode, path) => {
      elm()('button', {on: {click: true}})((elm, txt) => {
        elm()('button', {on: {click: true}})((elm, txt) => {
          txt('hi2')
        })
      })
      txt('hi')
    })
  )
  patch(
    H$()('div.b')((elm, txt, vnode, path) => {
      txt('hi3')
    })
  )
}).tap(x => console.info(x)).drain()

// function map (pith) {
//   return (elm, txt, vnode, path) => {
//     pmap(pith)(
//       (pmap = id) => elm(compose(map, pmap)),
//       txt, vnode,
//       action$.filter(x => x.vnode.data.path.endsWith(path)),
//       path
//     )
//   }
// }
