const m = require('most')
const $ = require('../$')
const H$ = require('./h$')
const {ReducerBark} = require('./state')
const {Cons, nil} = require('../list')
const id = a => a

const {async: subject} = require('most-subject')
const toVnode = require('snabbdom/tovnode').default
const {init} = require('snabbdom')
const createActionModule = require('../../lib/drivers/snabbdom/actionModule')
const defaultModules = ['class', 'props', 'style', 'attributes'].map(
  name => require('snabbdom/modules/' + name).default
)

const PatchBark = (pmap = id) => (elm, path = nil) => ReducerBark(
  function map (pith) {
    return function (obj, arr, val, select) {
      const rootVnode = toVnode(elm)
      const action$ = subject()
      const patchVnode = init([
        ...defaultModules,
        createActionModule(function (event) {
          const action = this.data.on[event.type]
          action$.next({ vnode: this, action, event })
        })
      ])
      select('vnode$')
        .switchLatest()
        .until(select('end').filter(Boolean).take(1))
        .reduce(patchVnode, rootVnode)
        .then(vnode => patchVnode(vnode, rootVnode))

      const end = e => val('end', $(e).constant(s => true))
      const patch = vnode$ => val('vnode$', s => vnode$)
      var i = 0
      const node = pmap => elm => pith => {
        const key = 'node' + i++
        val(key, PatchBark(pmap)(elm, Cons(key, path))(pith).map(s => () => s))
      }
      pmap(pith)(node, patch, end, action$, path)
    }
  }
)()

module.exports = PatchBark

PatchBark()(document.getElementById('root-node'))((node, patch, end, action$, path) => {
  patch(
    H$()('div#root-node')(function (elm, txt, vnode, path$) {
      elm()('h1')((e, txt) => txt('hello2'))
    })
  )
  end(m.of().delay(2000))
  node()(document.getElementById('root-node1'))((node, patch, end, action$, path) => {
    patch(
      H$()('div#root-node')(function (elm, txt, vnode, path$) {
        elm()('h1')((e, txt) => txt('hello1'))
      })
    )
    end(m.of().delay(3000))
  })
}).tap(x => console.info(x)).drain()
