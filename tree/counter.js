const m = require('most')
const css$ = require('./css$')
const mount = require('./mount')
const animationFrame$ = require('./animation-frame').take(1500)
const cycle$ = animationFrame$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.15), 0)
const sin$ = cycle$.map(i => Math.sin(i))
const cos$ = cycle$.map(i => Math.cos(i))

const elm = document.getElementById('root-node')
mount(elm, Counter(3))

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
