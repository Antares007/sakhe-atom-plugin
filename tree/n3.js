const debug = require('debug') // eslint-disable-line
const m = require('most')
const toVnode = require('snabbdom/tovnode').default
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  require('../lib/drivers/snabbdom/actionModule')
])

const H$ = require('./h$')
const {Cons} = require('./list')
const animationFrame$ = require('./animation-frame').take(15)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.5), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const cos$ = cycle$.map(i => Math.cos(i))

const fs = require('fs')
const promisify = f => (...args) => new Promise(
  (resolve, reject) => f(
    ...args,
    (err, value) => err ? reject(err) : resolve(value)
  )
)
const r$ = f => {
  const p = promisify(f)
  return (...args) => m.fromPromise(p(...args))
}
const readdir$ = r$(fs.readdir.bind(fs))

H$('div#root-node', {}, Folder(__dirname))
  .reduce(patch, toVnode(document.getElementById('root-node')))
  .then(console.log.bind(console))

function Folder (path) { // eslint-disable-line
  return h => {
    const action = 'action1'
    const b$ = h.$.filter(x => x.action === action).scan(b => !b, false)
    h('button', {on: {click: action}}, h => h('switch'))
    h('div', {}, b$.map(x => x ? Counter(2) : Tree(2, 2)))
    h(H$('div', { path: Cons('counter', h.path) }, Counter(2)))
  }
}

function Counter (d = 1) { // eslint-disable-line
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

function Tree (d = 1, w = 3) { // eslint-disable-line
  return (h) => {
    const rootPath = h.path
    const action = h.path
    h('button', {on: {click: action}}, h => {
      h(rootPath.toString() + ' - ' + h.path.toString())
    })
    h(h.$.filter(x => x.action.endsWith(action)).map(x => x.action.toString()).startWith(''))
    for (var i = 0; i < w; i++) {
      let action = d + '' + i
      h(
        'div',
        {
          style: css$`
            paddingLeft: ${sin$.map(i => Math.floor(i * 20 + 20.5))}px;
          `,
          on: { click: action }
        },
        h.$.filter(x => x.action === action && x.event.target instanceof window.HTMLButtonElement)
            .take(1)
            .map(x => h => h('div', {}, Tree(d - 1, w)))
            .startWith(h => h('button', {}, h => h('open')))
      )
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
