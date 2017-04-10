const most = require('most')

module.exports = function makeEmitterDriver (factory, dispose) {
  return function (action$) {
    const emitter = factory()

    action$.observe(([path, args]) => action(path.split('.'), args, emitter))

    return {
      event (path) {
        var segs = path.split('.')
        return event(segs.slice(0, -1), segs[segs.length - 1], emitter)
      },
      dispose: () => dispose(emitter)
    }
  }
}

function event (paths, type, emitter) {
  return paths.length === 0
    ? most.fromEvent(type, emitter)
    : event(paths.slice(1), type, emitter[paths[0]])
}

function action (paths, args, sub) {
  if (paths.length === 0) throw new Error('invalid operation')
  if (paths.length === 1) return sub[paths[0]].apply(sub, args)
  return action(paths.slice(1), args, sub[paths[0]])
}
