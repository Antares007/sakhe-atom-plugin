const {Stream} = require('most')

const fromCb = () => {
  var send
  return [
    (...args) => send && send(args),
    new Stream({
      run (sink, scheduler) {
        send = (e) => sink.event(scheduler.now(), e)
        return { dispose () { send = false } }
      }
    }).multicast()
  ]
}

module.exports = (hooks = [
  'pre', 'init', 'create', 'insert',
  'prepatch', 'update', 'postpatch',
  'destroy', 'post' // 'remove', 
]) => hooks.reduce(function (m, type) {
  const [cb, $] = fromCb()
  m[type + '$'] = $
  m[type] = (...args) => cb([type, args])
  return m
}, {})
