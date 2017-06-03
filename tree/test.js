const H = require('./h')
const m = require('most') //eslint-disable-line

H('div#root-node.a', Animation(0))

function camelCase (str) {
  const [first, ...last] = str.split('-')
  return first + last.reduce((s, a) => s + a[0].toUpperCase() + a.slice(1), '')
}

function css (str) {
  return str.split(/;|\n/).reduce((s, kvStr) => {
    const [keyStr, valueStr] = kvStr.split(':')
    const key = camelCase(keyStr.trim())
    if (key === '') return s
    s[key] = valueStr.trim()
    return s
  }, {})
}

function Animation (d = 4, w = 2) { //eslint-disable-line
  return ({h, path, $}) => {
    h('div.contentContainer', {
      style: css(`
        width: 100%;
        height: 100%;
        border: 5px black solid;
        overflow: hidden;
        background-color: #FFFF00;
        `),
      props: {
        width: '300px'
      }
    }, ({h}) => {
      const a$ = require('./animation-frame')
      const xy$ = a$.scan(incrementer => incrementer >= Math.PI * 2 ? 0 : incrementer + 0.01, 0)
        .map(i => [125 + 100 * Math.cos(i), 5 + 100 * Math.sin(i)])
      h('img', xy$.map(([x, y]) => ({
        style: css(`
          position: relative;
          left: ${x}px;
          top: ${y}px;
        `),
        attrs: css(`
          src: ../tree/donut.png
          width: 300px
          height: 300px
        `)
      })), '')
    })
  }
}
function Tree (d = 4, w = 2) { //eslint-disable-line
  return ({h, path, $}) => {
    h('button', { on: {click: 'from:' + path} }, path)
    h('span', $.map(x => x.action).startWith(''))
    for (var i = 0; i < w; i++) {
      if (d > 0) h('div', {style: {paddingLeft: '20px'}}, Tree(d - 1, w))
    }
  }
}

function Counter (d = 3) { //eslint-disable-line
  const color = 100 + d * 30
  return ({h, action$}) => {
    const sum$ = action$(-1).merge(action$(+1))
      .scan((sum, x) => sum + x.action, 0)
    h('div', {style: {padding: '5px 10px', textAlign: 'center'}}, ({h}) => {
      h('h2', {}, sum$)
      h('button', {
        on: {click: +1},
        style: { backgroundColor: `rgb(255, ${color}, ${color})` }
      }, ({h}) => {
        h('span', {}, '+')
        if (d > 0) h('div', {}, Counter(d - 1))
      })
      h('button', {
        on: {click: -1},
        style: { backgroundColor: `rgb(${color}, ${color}, 255)` }
      }, ({h}) => {
        h('span', {}, '-')
        if (d > 0) h('div', {}, Counter(d - 1))
      })
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
