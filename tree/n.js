const ATree = require('./atree')
const m = require('most')
const h = require('snabbdom').h
const toVnode = require('snabbdom/tovnode').default
const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])

const patchBark = (rootNode, vnode$) => vnode$.reduce(patch, toVnode(rootNode))

const {Cons, nil} = require('./list')

const to$ = (x) =>
  x instanceof m.Stream
  ? x
  : x && typeof x === 'object' && Object.keys(x).some(key => x[key] instanceof m.Stream)
  ? m.combineArray(function () {
    return Object.keys(x).reduce((s, key, i) => {
      s[key] = arguments[i]
      return s
    }, {})
  }, Object.keys(x).map(key => to$(x[key])))
  : m.of(x)

const h$ = (sel, data, children, path) =>
  m.combine(function (sel, data, children) {
    data.key = path.head
    data.path = path
    return h(sel, data, children)
  }, to$(sel), to$(data), to$(children))

const H = (sel, data, pith, path = nil) => {
  console.groupCollapsed(sel.toString(), path.toString(), JSON.stringify(data))
  console.groupCollapsed('pith')
  console.log(pith.toString())
  console.groupEnd('pith')
  var i = 0
  const vdom$ = ATree(
    vnode$s => h$(sel, data, m.combineArray((...children) => children, vnode$s), path),
    push => (sel, data, children) => push(
      (typeof children === 'function' ? H : h$)(sel, data, children, new Cons(i++, path))
    ),
    function (push) {
      pith(push, path.toString(), m.empty())
    }
  )
  console.groupEnd(sel.toString())
  return vdom$
}

const repeat = (n, stream) =>
  n <= 0
  ? m.empty()
  : n === 1
  ? stream
  : m.continueWith(() => repeat(n - 1, stream), stream)

const animationFrame$ = require('./animation-frame').take(1000)
const rootNode = document.getElementById('root-node')
console.profile('run')
patchBark(
  rootNode,
  H('div#root-node', {}, h => {
    h('div', {style: css$`width: 100%; height: 50%;`}, Tree(3, 3))
    h('div', {style: css$`width: 100%; height: 50%;`}, Animation(3, 3))
  })
).then(function log (vnode) {
  if (!vnode.children) return console.log(vnode.sel, vnode.elm, JSON.stringify(vnode.data))
  console.groupCollapsed(vnode.sel, vnode.elm, JSON.stringify(vnode.data))
  vnode.children.forEach(log)
  console.groupEnd(vnode.sel)
}).then(() => console.profileEnd('run'))

function Tree (d = 4, w = 2) { //eslint-disable-line
  return (h, path, $) => {
    h('h' + (d + 1), {}, path)
    for (var i = 0; i < w; i++) {
      if (d > 0) h('div', {style: {paddingLeft: '20px'}}, Tree(d - 1, w))
    }
  }
}

function Animation () { //eslint-disable-line
  return (h, x) => {
    const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.1), 0)
    const sin$ = cycle$.map(i => Math.sin(i))
    const cos$ = cycle$.map(i => Math.cos(i))
    h('div.contentContainer', {
      style: css$`
        width: 100%; height: 100%;
        border: 5px white solid;
        overflow: hidden;
        background-color: #FFFF66;
        `,
      props: {
        width: '300px'
      }
    }, (h, x) => {
      h('div', {
        style: css$`
          position: relative; width: 300px; height: 300px;
          left: ${cos$.map(i => Math.floor(225 + 200 * i + 0.5))}px;
          top: ${sin$.map(i => Math.floor(125 + 100 * i + 0.5))}px;
        `
      }, h => h('img', { attrs: css$`src: ../tree/donut.png; width: 300px; height: 300px;` }))
    })
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
