// const m = require('most')
const $ = require('../$')
const {Cons, nil} = require('../list')
const { ReducerBark } = require('./state')
const toVnode = require('snabbdom/tovnode').default
const {async: subject} = require('most-subject')
const h$ = require('./h$')
const id = a => a

const MountBark = (pith, pmap = id) => ReducerBark(pmap)(
  (obj, arr, val, state$) => {
    var i = 0
    pmap(pith)(
      pmap => elm => pith => {
        const key = i++
        const elm$ = $(elm).skipRepeats()
        obj()(key)(
          (o, a, v, state$) => {
            elm$.map(elm => {
              const rootVnode = toVnode(elm)
              const action$ = subject()
              const actionModule = require('../../lib/drivers/snabbdom/actionModule')(function (event) {
                action$.next({ vnode: this, action: this.data.on[event.type], event })
              })
              const patch = require('snabbdom').init([
                ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
                actionModule
              ])
              return h$()(
                rootVnode.sel, rootVnode.data
              )(pith).until(elm$.skip(1)).reduce(patch, rootVnode)
            })
            v('vnode', void 0)
          }
        )
        r.o('selectors', r => r.o(rootVnode.sel, r => {
          r('vnode',
            h$(
              rootVnode.sel,
              rootVnode.data,
              pith,
              function apiRing (pith) {
                return (elm, txt, path) => {
                  const h = (sel, data, pith) =>
                    !data && !pith
                    ? txt(sel)
                    : elm(id, pith => apiRing(pith))(sel, pith ? data : {})(pith || data)
                  h.path = path
                  h.$ = action$.filter(x => x.vnode.data.path.endsWith(path))
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
  }
)

module.exports = MountBark
