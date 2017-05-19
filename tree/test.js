const debug = require('debug')
const m = require('most')
const h = require('snabbdom/h').default
const h$ = (...args) => m.of(h(...args))
const div = (sel = '', data = {}) => m.of(children => h('div' + sel, data, children))

function Me (d = 0) {
  return (push, bark, path, $) => {
    path = '/' + path.join('/')
    $.filter(x => x.action.startsWith(path))
     .observe(debug(path))

    push(h$('button', {
      on: { click: path }
    }, path))

    for (let i = 0; i < 2; i++) {
      if (d < 5) {
        bark(div('.d' + d, { style: { paddingLeft: '10px' } }), Me(d + 1))
      }
    }
  }
}

const snabbdomBark = require('./snabbdom-bark')
snabbdomBark(document.getElementById('root-node'), Me()) // return disposable
