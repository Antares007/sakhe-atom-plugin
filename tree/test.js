const H = require('./h')
const m = require('most') //eslint-disable-line
const animationFrame$ = require('./animation-frame')

H('div#root-node.a', {}, Counter())
function Animation () { //eslint-disable-line
  return ({h}) => {
    const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.05), 0)
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
    }, ({h}) => {
      const attrs = css(`src: ../tree/donut.png; width: 300px; height: 300px`)
      h('img', {
        style: css$`
          position: relative
          left: ${cos$.map(i => 125 + 100 * i)}px
          top: ${sin$.map(i => 125 + 100 * i)}px
        `,
        attrs
      })
    })
  }
}

function Tree (d = 4, w = 2) { //eslint-disable-line
  return ({h, path, $}) => {
    h('button', { on: {click: 'from:' + path} }, path)
    h('span', {}, $.map(x => x.action).startWith(''))
    for (var i = 0; i < w; i++) {
      if (d > 0) h('div', {style: {paddingLeft: '20px'}}, Tree(d - 1, w))
    }
  }
}

function Counter (d = 1) { //eslint-disable-line
  return ({h, action$, animationFrame$}) => {
    const sum$ = action$(-1).merge(action$(+1))
      .scan((sum, x) => sum + x.action, 0)
    const picycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + 0.1, 0)
    const sin$ = picycle$.map(i => Math.sin(i))
    const cos$ = picycle$.map(i => Math.cos(i))
    const color$ = wave$ => wave$.map(i => 100 + d * 20 + Math.floor(30 * i))
    const r = 10
    h('div', {style: {padding: '5px 10px', textAlign: 'center'}}, ({h}) => {
      h('button', {
        on: {click: +1},
        style: css$`
          position: relative
          border-radius: ${sin$.map(i => Math.abs(Math.floor(i * 20)))}px
          // left: ${sin$.map(i => Math.floor(r * i))}px
          // top: ${cos$.map(i => Math.floor(r * i))}px
          backgroundColor: rgb(255, ${color$(sin$)}, ${color$(cos$)})
        `
      }, ({h}) => {
        h('span', {}, '+')
        if (d > 0) h('div', {}, Counter(d - 1))
      })

      h('button', {
        on: {click: -1},
        style: css$`
          position: relative
          border-radius: ${cos$.map(i => Math.abs(Math.floor(i * 20)))}px
          // left: ${cos$.map(i => Math.floor(r * i))}px
          // top: ${sin$.map(i => Math.floor(r * i))}px
          backgroundColor: rgb(${color$(cos$)}, ${color$(sin$)}, 255)
        `
      }, ({h}) => {
        h('span', {}, '-')
        if (d > 0) h('div', {}, Counter(d - 1))
      })

      h('h2', {}, sum$)
    })
  }
}

function Counter_ (d = 1) { //eslint-disable-line
  return function ({h, action$}) {
    const sum$ = action$(-1).merge(action$(+1))
      .scan((sum, x) => sum + x.action, 0)
    this.l(sum$.map(sum => ['h2', {}, sum]))
    this.n(m.of(['button', { on: {click: +1} }]), ({h}) => {
      this.l(m.of(['span', {}, '+']))
      if (d > 0) this.n(m.of(['div', {}]), Counter(d - 1))
    })
    this.n(m.of(['button', { on: {click: -1} }]), ({h}) => {
      this.l(m.of(['span', {}, '-']))
      if (d > 0) this.n(m.of(['div', {}]), Counter(d - 1))
    })
  }
}

function Form () { //eslint-disable-line
  return function ({action$}) {
    // var state
    const state$ = action$('input').map(x => x.event.target.value)
        .scan((s, v) => v, '')
        // .tap(s => { state = s })
        .multicast()
    this.put(state$.map(value => h =>
      h('div', {}, [
        h('input', {
          on: {input: 'input'},
          props: {type: 'text', value}
        }),
        h('button', {
          on: {click: 'add'},
          props: {disabled: value.length === 0}
        }, 'add')
      ])
    ))
    // this.return(action$('add').map(() => state))
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
    exprs.map(x => x && x.source ? x.skipRepeats() : m.of(x))
  )
}
