const debug = require('debug')
const m = require('most')
const h = require('snabbdom/h').default
const h$ = (...args) => m.of(h(...args))

const pith = (function TestPith (d = 0) {
  return function (push, path, $) {
    $.observe(debug(path))
    push(m.of(children => h('div.node', { style: {paddingLeft: '10px'} }, children)))
    push(h$('button', { on: { click: path } }, [ h('b', path) ]))
    for (let i = 0; i < 2; i++) {
      if (d < 4) {
        this.bark(TestPith(d + 1))
      }
    }
  }
})()

const snabbdomBark = require('./snabbdom-bark')
snabbdomBark(document.getElementById('root-node'), pith) // return disposable
