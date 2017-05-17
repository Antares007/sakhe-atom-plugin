const debug = require('debug')

function A (f) {
  return function a (heart) {
    const as = []
    heart.call({ node: heart => { as.push(a(heart)) } }, a => as.push(a))
    return f(as)
  }
}
const Type = (is, coerce) => ({
  is,
  validate (x) { if (!is(x)) throw TypeError(is.toString()) },
  coerce (x) { return is(x) ? x : (coerce ? coerce.call(this, x) : this.validate(x)) }
})
const $Type = (type) => ({
  is ($) { return $.map(type.is) },
  validate ($) { return $.tap(type.validate) },
  coerce ($) { return $.map(type.coerce.bind(type)) }
})

// typeOfvdom$.coerce(m.of({})).observe(x => console.log(x))
main()
function main () {
  const m = require('most')
  const snabbdom = require('snabbdom')
  const h = snabbdom.h
  const h$ = (...args) => m.of(h(...args))
  const vdomType = Type(
    x => !!(x && typeof x.sel === 'string'),
    x => h('div.node', x + '')
  )
  const functionType = Type(x => typeof x === 'function')
  const vdom$Type = $Type(vdomType)
  const function$Type = $Type(functionType)

  const VdomTree = A(([head, ...tail]) =>
    vdom$Type.validate(
      function$Type.validate(head)
        .ap(m.combineArray((...vnodes) =>
          vnodes.map((vnode, i) => Object.assign({}, vnode, {key: i})),
          tail.map(vdom$Type.coerce)
        ))
    )
  )
  function TestHeart (d = 0) {
    const tick$ = m.periodic(10)
      .scan(a => a + 1, 0)
      .map(i => Math.floor(20 + Math.sin(i / 100) * 20))
      .skipRepeats()
      .multicast()
    return function (push, path, $) {
      $.observe(debug(path))
      push(tick$.map(i => children =>
        h('div.node', {
          style: {paddingLeft: (i) + 'px'}
        }, children)
      ))
      push(h$('button', { on: { click: path } }, [ h('b', path) ]))
      for (let i = 0; i < 2; i++) {
        if (d < 2) {
          this.node(TestHeart(d + 1))
        }
      }
    }
  }

  const actionModule = require('../lib/drivers/snabbdom/actionModule')

  const vnode$ = VdomTree(
    addPathInput(
      addInput(prev => prev || actionModule.action$,
        mapInputs(
          ([push, path, $]) => [
            push,
            '/' + path.join('/'),
            $.filter(x => x.action.startsWith('/' + path.join('/')))
          ],
          TestHeart()
        )
      )
    )
  )

  SnabbdomRootNode(document.getElementById('root-node'), vnode$, [
    ...['class', 'props', 'style']
      .map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])

  function mapInputs (f, heart, p) {
    return function (...args) {
      heart.apply({
        node: heart => this.node(mapInputs(f, heart))
      }, f(args))
    }
  }
  function addInput (map, heart, initial = void 0) {
    return function (...args) {
      const input = map(initial)
      heart.apply({
        node: heart => {
          this.node(addInput(map, heart, input))
        }
      }, [...args, input])
    }
  }
  function addPathInput (heart, path = []) {
    return function (...args) {
      var i = 0
      heart.apply({
        node: heart => {
          this.node(addPathInput(heart, [...path, i]))
          i++
        }
      }, args.concat([path]))
    }
  }
}

function SnabbdomRootNode (elm, vnode$, modules) {
  const patch = require('snabbdom').init(modules)
  vnode$
    // .tap(debug('patch'))
    .reduce(patch, elm)
  // const Nil = {
  //   toString () {
  //     return 'Nil'
  //   }
  // }
  // const Cons = (head, tail) => ({
  //   head,
  //   tail,
  //   toString () {
  //     return 'cons(' + this.head + ', ' + tail.toString() + ')'
  //   }
  // })
  // function isolateSink ($, scope) {
  //   return $.map(function mapVnode (vnode) {
  //     const scopes = vnode.scopes
  //     const children = vnode.children
  //     return Object.assign({}, vnode, {
  //       scopes: scopes ? Cons(scope, scopes) : Cons(scope, Nil),
  //       children: children ? children.map(mapVnode) : children
  //     })
  //   })
  // }
  //
  // function isolateSource ($, scope) {
  //   return $.filter(({vnode}) => vnode.scopes && vnode.scopes.head === scope)
  //     .tap(debug('isolateSource' + scope + ':'))
  //     .map((x) => Object.assign({}, x, {
  //       vnode: Object.assign({}, x.vnode, {
  //         scopes: x.vnode.scopes.tail
  //       })
  //     }))
  // }

  // function SnabbdomRootNode () {}
  //
  // const snabbdomnode = SnabbdomRootNode(elm, (data, children) => h('div', data, children), function (g, $) {
  //   g(snabbdomnode((data, children) => h('div', data, children), function (g, $) {
  //
  //   }))
  // })
  //
}
