const debug = require('debug')
const m = require('most')
const snabbdom = require('snabbdom')
const h = snabbdom.h
const h$ = (...args) => m.of(h(...args))

const ring = SnabbdomBark(elm, function pith (...rays) {
  rays[0].push(m.of(children => h('div', children)))
  rays[0].push(h$(h('h1', 'hi')))
})

function TestHeart (d = 0, delay = 0) {
  const tick$ = m.periodic(2000).delay(delay)
    .scan(a => a + 1, 0)
    .map(i => Math.floor(30 + Math.sin(i / 50) * 30))
    .skipRepeats()
    .multicast()
  return function (push, path, $) {
    $.observe(debug(path))
    push(tick$.map(i => children =>
      h('div.node', {
        style: {paddingLeft: i + 'px'}
      }, children)
    ))
    push(h$('button', { on: { click: path } }, [ h('b', path) ]))
    for (let i = 0; i < 2; i++) {
      if (d < 5) {
        push(ring(TestHeart(d + 1, d * 500 + i * 200)))
      }
    }
  }
}

function VdomRing () {
  const m = require('most')
  const h = require('snabbdom/h')
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
  const vdomType = Type(
    x => !!(x && typeof x.sel === 'string'),
    x => h('div', x + '')
  )
  const functionType = Type(x => typeof x === 'function')
  const vdom$Type = $Type(vdomType)
  const function$Type = $Type(functionType)
  const Tree = require('./tree')
  const ring = Tree(
    ([head, ...tail]) =>
      vdom$Type.validate(
        function$Type.validate(head)
          .ap(m.combineArray((...vnodes) =>
            vnodes.map((vnode, i) => Object.assign({}, vnode, {key: i})),
            tail.map(vdom$Type.coerce)
          ))
      )
  )
  return ring
}

function SnabbdomBark (ring) {
  const actionModule = require('../lib/drivers/snabbdom/actionModule')
  const vnode$ =
  ring(
    addPathInput(
      addInput(prev => prev || actionModule.action$,
        mapInputs(
          ([push, path, $]) => [
            push, '/' + path.join('/'),
            $.filter(x => x.action.startsWith('/' + path.join('/')))
          ],
          TestHeart()
        )
      )
    )
  )
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
          this.node(addPathInput(heart, path.concat(i)))
          i++
        }
      }, args.concat([path]))
    }
  }

  SnabbdomRootNode(document.getElementById('root-node'), vnode$, [
    ...['class', 'props', 'style']
      .map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])
}

function SnabbdomRootNode (elm, vnode$, modules) {
  const patch = require('snabbdom').init(modules)
  vnode$
    // .tap(debug('patch'))
    .reduce(patch, elm)
}
