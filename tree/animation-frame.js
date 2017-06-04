const m = require('most')

module.exports = new m.Stream({
  run (sink, scheduler) {
    var token
    var disposable
    function nextFrame () {
      disposable = scheduler.asap(m.PropagateTask.event(scheduler.now(), sink))
      token = window.requestAnimationFrame(nextFrame)
    }
    nextFrame()
    return {
      dispose () {
        window.cancelAnimationFrame(token)
        disposable.dispose()
      }
    }
  }
}).multicast()
