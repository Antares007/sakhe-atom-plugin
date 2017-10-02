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
      select('vnode$s')
        .filter(vnode$s => vnode$s.length)
        .map(vnode$s =>
          H$()(rootVnode.sel, rootVnode.data, path)((e, t, v) => {
            vnode$s.forEach(vnode$ => v(vnode$))
          })
        )
        .switchLatest()
        .until(select('end').filter(Boolean).take(1))
        .tap(x => x.log())
        .reduce(patchVnode, rootVnode)
        .then(vnode => patchVnode(vnode, rootVnode))

      var i = 0
      pmap(pith)(
        pmap => (sel, data = {}) => pith => {
          const key = i++
          arr()('vnode$s')((obj, arr, val) => {
            val(
              key,
              s => H$(pmap)(
                sel,
                $(data).map(d => Object.assign({key}, d)),
                Cons(key, path)
              )(pith)
            )
          })
        },
        e => val('end', $(e).constant(s => true))
      )
    }
  }
)()

module.exports = PatchBark

PatchBark()(document.getElementById('root-node'))((elm, end) => {
  elm()('div.a')((elm, txt, vnode, path) => {
    elm()('h1')((e, txt) => txt('hello'))
  })
  elm()('div.b')((elm, txt, vnode, path) => {
    elm()('h2')((e, txt) => txt('hello'))
  })
  elm()('div.c')((elm, txt, vnode, path) => {
    elm()('h3')((e, txt) => txt('hello'))
  })
  end(m.of().delay(3000))
}).tap(x => console.info(x)).drain()
