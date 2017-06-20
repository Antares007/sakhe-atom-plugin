const ATree = require('./atree')
const m = require('most')
const h = require('snabbdom').h
const {Cons, nil} = require('./list')
const toVnode = require('snabbdom/tovnode').default
const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])
const animationFrame$ = require('./animation-frame').take(1000)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.05), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const cos$ = cycle$.map(i => Math.cos(i))

const rootNode = document.getElementById('root-node')

console.profile('run')
H('div#root-node', {}, Tree(3, 2))
  .reduce(patch, toVnode(rootNode))
  .then(vnode => { console.profileEnd('run'); return vnode })
  .then(function log (vnode) {
    if (!vnode.children) return console.log(vnode.sel, vnode.elm, JSON.stringify(vnode.data))
    console.groupCollapsed(vnode.sel, vnode.elm, JSON.stringify(vnode.data))
    vnode.children.forEach(log)
    console.groupEnd(vnode.sel)
  })

function H (sel, data, pith, path = nil) {
  var i = 0
  return to$(pith).map(pith => ATree(
    vnode$s => m.combine(function (sel, data, ...children) {
      data.key = path.head
      data.path = path
      return h(sel, data, children)
    }, to$(sel), to$(data), ...vnode$s),
    push => (sel, data, pith) => {
      if (sel && data && pith) {
        push(H(sel, data, pith, Cons(i++, path)))
      } else {
        push(to$(sel))
      }
    },
    h => pith(h, path, actionModule.action$)
  )).switchLatest()
}

function to$ (x) {
  return (
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
  )
}

function Tree (d = 6, w = 3) { //eslint-disable-line
  return (h, path, $) => {
    h('div', {on: {click: path}}, h => {
      h(path.toString())
      h($.filter(x => x.action === path).constant('a').startWith('b'))
    })
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        h('div', {
          style: sin$.map(i => ({paddingLeft: Math.floor(20 + 20 * i + 0.5) + 'px'}))
        }, m.of(Tree(d - 1, w)).delay(1000 + Math.random() * 1000).merge(m.of(h => h('Loading...'))))
      }
    }
  }
}

function Animation () { //eslint-disable-line
  return (h, x) => {
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
      }, h => h('img', { attrs: css$`src: ../tree/donut.png; width: 300px; height: 300px;` }, h => {}))
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
