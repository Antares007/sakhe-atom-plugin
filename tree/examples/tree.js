const m = require('most')
const animationFrame$ = require('./animation-frame').take(1500)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.05), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const PatchBark = require('../barks/patch')

PatchBark()(document.getElementById('root-node'))(h => {
  h('div.app1', Tree(2, 3))
})
  .debounce(100)
  .tap(x => x.log(x))
  .drain()

function Tree (d = 1, w = 3) {
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
