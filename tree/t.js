const mount = require('./mount')
const m = require('most')

mount(document.getElementById('root-node'), Root())
function Root () {
  return h => {
    h('ul', m.periodic(1000).take(1).map(() => Test()))
  }
}
function Test () {
  return h => {
    h('li', h => h(0))
    h('li', m.of(h => h(1)))
    h('li', m.periodic(3000).skip(1).take(1).map(() => Root()).startWith(h => h('...')))
    h('li', h => h(2))
  }
}
