const {Stream} = require('most')
const hooks = [
  'pre', 'init', 'create', 'insert',
  'prepatch', 'update', 'postpatch',
  'destroy', 'remove', 'post'
]
module.exports = hooks.reduce(function (m, type) {
  var send
  m[type + '$'] = new Stream({
    run (sink, scheduler) {
      send = (e) => sink.event(scheduler.now(), e)
      return { dispose () { send = false } }
    }
  }).multicast()
  m[type] = (...args) => {
    if (send) return send(args)
    if (type === 'remove') args[1]()
  }
  return m
}, {})
