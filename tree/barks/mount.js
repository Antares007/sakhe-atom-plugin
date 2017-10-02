const m = require('most')
const $ = require('../$')
const {Cons, nil} = require('../list')
const { ReducerBark } = require('./state')
const {async: subject, hold} = require('most-subject')
const toVnode = require('snabbdom/tovnode').default
const {init} = require('snabbdom')
const createActionModule = require('../../lib/drivers/snabbdom/actionModule')
const defaultModules = ['class', 'props', 'style', 'attributes'].map(
  name => require('snabbdom/modules/' + name).default
)
const h$ = require('./h$')
const id = a => a

// const pairwise = (initial, stream) => m.loop(pairs, initial, stream)
// const pairwise1 = stream => m.skip(1, pairwise(void 0, stream))
// const pairs = (prev, current) => ({ seed: current, value: [prev, current] })

const MountBark = (pmap = id) => (initState = {}, path = nil) => ReducerBark(pith => (obj, arr, val, state$) => {
  var i = 0
  pmap(pith)(
    (pmap = id) => elm => pith => {
      const key = i++
      const elm$ = hold(1, $(elm)).skipRepeats()
      obj()('mount' + key)(
        (o, a, v, state$) => {
          const proxy$ = subject()
          v('node', proxy$.join()
            .startWith(s => typeof s === 'object' && s !== null ? s : {})
          )
          const patching$ = elm$.map(elm => {
            const rootVnode = toVnode(elm)
            const action$ = subject()
            const patch = init([
              ...defaultModules,
              createActionModule(function (event) {
                const action = this.data.on[event.type]
                action$.next({ vnode: this, action, event })
              })
            ])
            const thisPath = Cons(key, path)
            // var j = 0
            return h$(function map (pith) {
              return (element, text, vnode, path$) => {
                const mount = pmap => pith => {
                  // const key = j++
                  console.log('mount')
                  state$.take(1).observe(x => console.log(x))
                  // proxy$.next(
                  //   state$.flatMap(state =>
                  //     MountBark(pmap)({}, Cons(key, thisPath))(pith)
                  //       .map(state => s => Object.assign({}, s, {[key]: state}))
                  //   )
                  // )
                }
                pmap(pith)(element, text, vnode, path$, mount)
              }
            })(
              rootVnode.sel,
              Object.assign({}, rootVnode.data, {path: thisPath})
            )(pith)
              .until(elm$.skip(1).take(1))
              .reduce(patch, rootVnode)
              .then(vnode => (s) => patch(vnode, rootVnode))
          }).awaitPromises()
            .flatMap(fd => elm$.skip(1).take(1).map((elm) => fd))
          v('vnode', patching$)
        }
      )
    }
  )
})(initState)

module.exports = MountBark
const counter$ = p => m.periodic(p).scan(a => a + 1, 0)
MountBark()()(
  patch => {
    // var i = 0
    patch()(counter$(1000).map(i => document.getElementById('root-node' + (i % 4))))(
      m.of((element, txt, vnode, path$, mount) => {
        txt('hello')
        mount()(patch => {

        })
      }).delay(100)
    )
  }
)
.tap(x => console.info(x))
.drain()
