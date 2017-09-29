// const m = require('most')
const css$ = require('./css$')

const {async: subject} = require('most-subject')
const action$ = subject()
const toVnode = require('snabbdom/tovnode').default
const actionModule = require('../lib/drivers/snabbdom/actionModule')(function (event) {
  action$.next({ vnode: this, action: this.data.on[event.type], event })
})
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])
const h$ = require('./create-h$')

const animationFrame$ = require('./animation-frame').take(1500)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.15), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const cos$ = cycle$.map(i => Math.cos(i))

h$('div#root-node', {}, h => {
  h('div', showHideRing(Counter(0)))
  h('div', showHideRing(Counter(1)))
  h('div', showHideRing(Counter(2)))
  h('div', showHideRing(Counter(3)))
}, function map (pith) {
  return oh => {
    const h = (sel, data, pith, fmap = a => a) => oh(sel, data, pith, pith => map(fmap(pith)))
    h.path = oh.path
    h.$ = action$.filter(x => x.vnode.data.path.endsWith(h.path))
    pith(h)
  }
})
  .scan(patch, toVnode(document.getElementById('root-node')))
  .throttle(1000)
  .tap(console.log.bind(console))
  .drain()

function Counter (d = 1) { // eslint-disable-line
  return h => {
    const sum$ = h.$.map(x => x.action).scan((sum, v) => sum + v, 0)
    const color$ = wave$ => wave$.map(i => 100 + d * 20 + Math.floor(30 * i))
    const r = 10
    h('div', {style: {padding: '5px 10px', textAlign: 'center'}}, h => {
      h('button', {
        on: {click: +1},
        style: css$`
          position: relative; outline: none
          border-radius: ${sin$.map(i => Math.abs(Math.floor(i * 20)))}px
          // left: ${cos$.map(i => Math.floor(r * i))}px
          // top: ${sin$.map(i => Math.floor(r * i))}px
          backgroundColor: rgb(255, ${color$(sin$)}, ${color$(cos$)})
        `
      }, h => {
        h('span', {}, h => h('+'))
        if (d > 0) h('div', {}, Counter(d - 1))
      })
      h('button', {
        on: {click: -1},
        style: css$`
          position: relative; outline: none
          border-radius: ${cos$.map(i => Math.abs(Math.floor(i * 20)))}px
          // left: ${sin$.map(i => Math.floor(r * i))}px
          // top: ${cos$.map(i => Math.floor(r * i))}px
          backgroundColor: rgb(${color$(sin$)}, ${color$(cos$)}, 255)
        `
      }, h => {
        h('span', {}, h => h('-'))
        if (d > 0) h('div', {}, Counter(d - 1))
      })
      h('h3', {}, h => h(sum$))
    })
  }
}

function showHideRing (pith) {
  return function showHidePith (h) {
    const showHide$ = h.$.filter(({action}) => action === showHide$)
      .scan(b => !b, false).multicast()
    h(
      'button',
      {on: {click: showHide$}},
      showHide$.map(show => h => h(show ? 'hide' : 'show'))
    )
    h('div', showHide$.map(show => show ? pith : h => {}))
  }
}
