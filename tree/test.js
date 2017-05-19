const debug = require('debug')
const m = require('most')
const h = require('snabbdom/h').default
const h$ = (...args) => m.of(h(...args))
const div = (sel = '', data = {}) => m.of(children => h('div' + sel, data, children))
const node = require('./vdom-bark')
const pith = (push, stop = false) => push(
  h$('div', 'hi 1'),
  node(div('.node0'), push => push(
    h$('div', 'hi 2')
  ))
)

const snabbdomBark = require('./snabbdom-bark')
snabbdomBark(document.getElementById('root-node'), pith) // return disposable
