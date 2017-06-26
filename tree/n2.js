const m = require('most')
const toVnode = require('snabbdom/tovnode').default
const actionModule = require('../lib/drivers/snabbdom/actionModule')
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])
const animationFrame$ = require('./animation-frame').take(2000)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.03), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const cos$ = cycle$.map(i => Math.cos(i))
const {nil} = require('./list')
const H = require('./h_.js')

const rootNode = document.getElementById('root-node')

H('div#root-node', {}, (h, path) => {
  h('button', {on: {click: 'load'}}, h => h('load'))
  h('div', {}, action$(path)
                .filter(x => x.action === 'load')
                .constant(Tree(3, 2))
                .startWith(h => h('press button'))
  )
}).reduce(patch, toVnode(rootNode))

function action$ (apath) {
  return actionModule
    .action$
    .filter(x => endsWith(x.vnode.data.path, apath))
  function endsWith (apath, path) {
    return (
      apath === path
      ? true
      : apath === nil
      ? false
      : endsWith(apath.tail, path)
    )
  }
}

function Scroll () { //eslint-disable-line
  return h => {
    h('div', { style: css$`width: 300px;height: 500px;overflow: scroll;overflow-x: hidden;` }, h => {
      h('div', { style: css$`width: 300px;height: ${500 * 10000}px` }, h => {})
    })
  }
}

function Counter (d = 1) { //eslint-disable-line
  return (h, path) => {
    const sum$ = action$(path).map(x => x.action)
      .scan((sum, v) => sum + v, 0)
    const color$ = wave$ => wave$.map(i => 100 + d * 20 + Math.floor(30 * i))
    const r = 10
    h('div', {style: {padding: '5px 10px', textAlign: 'center'}}, h => {
      h('button', {
        on: {click: +1},
        style: css$`
          position: relative
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
          position: relative
          border-radius: ${cos$.map(i => Math.abs(Math.floor(i * 20)))}px
          // left: ${sin$.map(i => Math.floor(r * i))}px
          // top: ${cos$.map(i => Math.floor(r * i))}px
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
  return (h, path, $) => {
    h('button', {on: {click: path}}, h => {
      h(path.toString())
    })
    h(action$(path).constant('a').startWith('b'))
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        h('div', {
          style: {
            paddingLeft: '20px'
          }
        }, m.of(Tree(d - 1, w))
            .delay(100 + Math.random() * 1000)
            .merge(m.of(h => h('Loading...')))
        )
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

// .then(function log (vnode) {
//   if (!vnode.children) return console.log(vnode.sel, vnode.elm, JSON.stringify(vnode.data))
//   console.groupCollapsed(vnode.sel, vnode.elm, JSON.stringify(vnode.data))
//   vnode.children.forEach(log)
//   console.groupEnd(vnode.sel)
// })
