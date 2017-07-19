const m = require('most')
const mount = require('./mount')
// const {Cons, nil} = require('./list')
const elm = document.getElementById('root-node')

mount(elm, HelloMessage('Jane'))

mount(elm, Timer)

function HelloMessage (name) {
  return h => h('div', {}, h => h('Hello ' + name))
}

function Timer (h) {
  h('div', {}, h => h(m.periodic(1000).take(5).scan(a => a + 1, 0).map(s => 'Seconds Elapsed: ' + s)))
}
