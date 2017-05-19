// const debug = require('debug')
// const m = require('most')
const h = require('snabbdom/h').default

function Me (d = 0) {
  return ({put, bark, path, $}) => {
    put(
      h('div', path),
      $.scan((sum, x) => sum + x.action, 0)
        .map(sum => h('div', sum))
    )
    bark(h('button', {on: {click: +1}}), ({put, bark}) => {
      put('+')
      if (d < 3) bark(h('div'), Me(d + 1))
    })
    bark(h('button', {on: {click: -1}}), ({put, bark}) => {
      put('-')
      if (d < 3) bark(h('div'), Me(d + 1))
    })
  }
}

require('./snabbdom-bark')(
  document.getElementById('root-node'),
  Me()
) // return disposable
