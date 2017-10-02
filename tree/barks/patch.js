const $ = require('../$')
const H$ = require('./h$')
const {ReducerBark} = require('./state')
const {Cons, nil} = require('../list')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

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
      const element = (pmap = id) => (sel, data = {}) => pith => {
        const key = i++
        arr()('vnode$s')((obj, arr, val) => {
          val(
            key,
            s => H$(
              map
            )(
              sel,
              $(data).map(d => Object.assign({key}, d)),
              Cons(key, path)
            )(pith)
          )
        })
      }
      const end = e => val('end', $(e).constant(s => true))

      obj()('state')(pmap(pith)(element, end))
      function map (pith) {
        return (elm, txt, vnode, path) => {
          pmap(pith)(
            (pmap = id) => elm(compose(map, pmap)),
            txt, vnode,
            action$.filter(x => x.vnode.data.path.endsWith(path)),
            path
          )
        }
      }
    }
  }
)()

module.exports = PatchBark

const m = require('most')
PatchBark()(document.getElementById('root-node'))(
  (elm, end) =>
  (o, a, v, s) => {
    o()('key')((o, a, v, s) => v('key', s => 'value'))
    elm()('div.a')((elm, txt, vnode, $, path) => {
      $.observe(x => console.warn(x))
      elm()('h1', {on: {click: 1}})((e, txt) => txt(s('key', s('key'))))
      elm()('div.a')((elm, txt, vnode, $, path) => {
        $.observe(x => console.warn(x))
        elm()('h1', {on: {click: 1}})((e, txt) => txt(s('key', s('key'))))
      })
    })
    elm()('div.b')((elm, txt, vnode, $, path) => {
      elm()('h2')((e, txt) => txt('hello'))
    })
    elm()('div.c')((elm, txt, vnode, $, path) => {
      elm()('h3')((e, txt) => txt('hello'))
    })
    end(m.of().delay(3000))
  }
).tap(x => console.info(x)).drain()
