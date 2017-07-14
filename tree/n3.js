const m = require('most')
const toVnode = require('snabbdom/tovnode').default
const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])

const H$ = require('./h$')
const animationFrame$ = require('./animation-frame').take(2000)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.05), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const cos$ = cycle$.map(i => Math.cos(i))

H$('div#root-node', {}, Tree(3, 2))
  .reduce(patch, toVnode(document.getElementById('root-node')))
  .then(console.log.bind(console))

function Test () {
  return h => {
    const value$ = h.$.map(x => x.event.target.value)
    h('input', {props: {type: 'text'}, on: {input: 'input'}}, h => {})
    h('h1', {}, h => h(value$.startWith('').map(value => 'hello ' + value)))
  }
}


function Counter (d = 1) { //eslint-disable-line
  return h => {
    const sum$ = h.$.map(x => x.action).scan((sum, v) => sum + v, 0)
    const color$ = wave$ => wave$.map(i => 100 + d * 20 + Math.floor(30 * i))
    const r = 10
    h('div', {style: {padding: '5px 10px', textAlign: 'center'}}, h => {
      h('button', {
        on: {click: +1},
        style: css$`
          position: relative
          border-radius: ${sin$.map(i => Math.abs(Math.floor(i * 20)))}px
          left: ${cos$.map(i => Math.floor(r * i))}px
          top: ${sin$.map(i => Math.floor(r * i))}px
          backgroundColor: rgb(255, ${color$(sin$)}, ${color$(cos$)})
        `
      }, h => {
        h('span', {}, h => h('+'))
        if (d > 0) h('div', {}, Counter(d - 1))
      })
      h('button', {
        on: {click: -1},
        style: css$`
          position: relative
          border-radius: ${cos$.map(i => Math.abs(Math.floor(i * 20)))}px
          left: ${sin$.map(i => Math.floor(r * i))}px
          top: ${cos$.map(i => Math.floor(r * i))}px
          backgroundColor: rgb(${color$(sin$)}, ${color$(cos$)}, 255)
        `
      }, h => {
        h('span', {}, h => h('-'))
        if (d > 0) h('div', {}, Counter(d - 1))
      })
      h('h2', {}, h => h(sum$))
    })
  }
}

function Tree (d = 1, w = 3) { //eslint-disable-line
  return (h) => {
    h('button', {on: {click: h.path}}, h => {
      h(h.path.toString())
    })
    h(h.$.constant('a').startWith('b'))
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        h('div', {
          style: css$`
            paddingLeft: ${sin$.map(i => Math.floor(i * 20 + 20.5))}px
          `
        }, m.of(Tree(d - 1, w))
            .delay(100 + Math.random() * 1000)
            .merge(m.of(h => h('Loading...')))
        )
      }
    }
  }
}

function camelCase (str) {
  const [first, ...last] = str.split('-')
  return first + last.reduce((s, a) => s + a[0].toUpperCase() + a.slice(1), '')
}

function css (str) {
  return str.split(/;|\n/).reduce((s, kvStr) => {
    const [keyStr, valueStr] = kvStr.split(':')
    const key = camelCase(keyStr.trim())
    if (key === '' || key.startsWith('//')) return s
    s[key] = valueStr.trim()
    return s
  }, {})
}

function css$ (strings, ...exprs) {
  if (exprs.length === 0) return m.of(css(strings[0]))
  return m.combineArray(
    (...exprs) => css(strings.slice(1).reduce((rez, s, i) => rez + exprs[i] + s, strings[0])),
    exprs.map(x => x instanceof m.Stream ? x : m.of(x))
  )
}

  // const H = require('./h')
  // patch(
  //   toVnode(document.getElementById('root-node')),
  //   H('div#root-node', {}, h => {
  //     h('button', {}, h => {
  //       h(42)
  //       h('button', {}, h => {
  //         h(43)
  //       })
  //     })
  //     h('hi')
  //   })
  // )
