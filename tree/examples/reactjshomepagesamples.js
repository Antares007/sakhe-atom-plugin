const m = require('most')
const MountBark = require('../barks/mount')

MountBark(function (r, m) {
  m(document.getElementById('root-node'), HelloMessage('archil'))
  m(document.getElementById('root-node'), Timer)
}).throttle(1000)
  .tap(console.log.bind(console))
  .drain()

function HelloMessage (name) {
  return h => h('div', {}, h => h('Hello ' + name))
}

function Timer (h) {
  h('div', {}, h => h(m.periodic(1000).take(5).scan(a => a + 1, 0).map(s => 'Seconds Elapsed: ' + s)))
}
