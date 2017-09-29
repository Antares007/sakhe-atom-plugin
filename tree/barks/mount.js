// const m = require('most')
// const $ = require('../$')
const {Cons, nil} = require('../list')
const { ReducerBark } = require('./state')
const toVnode = require('snabbdom/tovnode').default
const {async: subject} = require('most-subject')
const h$ = require('./h$')
const id = a => a

module.exports = MountBark

function MountBark (pith, pmap = id) {
  return ReducerBark(r => {
    var i = 0
    const nr = (key, v) => r.o('state', r => r(key, v))
    nr.o = (key, pith, pmap = id) => r.o('state', r => r.o(key, pith, pmap))
    nr.a = (key, pith, pmap = id) => r.o('state', r => r.a(key, pith, pmap))
    nr.$ = r.$
    pmap(pith)(
      nr,
      (elm, pith) => {
        const rootVnode = toVnode(elm)
        const action$ = subject()
        const actionModule = require('../../lib/drivers/snabbdom/actionModule')(function (event) {
          action$.next({ vnode: this, action: this.data.on[event.type], event })
        })
        const patch = require('snabbdom').init([
          ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
          actionModule
        ])
        r.o('selectors', r => r.o(rootVnode.sel, r => {
          r('vnode',
            h$(
              rootVnode.sel,
              rootVnode.data,
              pith,
              function map (pith) {
                return oh => {
                  const h = (sel, data, pith, fmap = a => a) => oh(sel, data, pith, pith => map(fmap(pith)))
                  h.path = oh.path
                  h.$ = action$.filter(x => x.vnode.data.path.endsWith(h.path))
                  pith(h)
                }
              },
              dc => a$s => dc(a$s).map(([sel, data, ...children]) => ({sel, key: data.key, data, children})),
              Cons(i++, nil)
            ).scan((oldVnode, vnode) => patch(oldVnode, vnode), rootVnode).map(vnode => s => vnode)
          )
        }))
      }
    )
  })
}
