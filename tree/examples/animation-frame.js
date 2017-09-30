const { Stream } = require('most')

module.exports = new Stream({
  run (sink, scheduler) {
    const taskRequestFrame = {
      run (t) {
        const nextFrame = () => {
          console.timeStamp('nextFrame')
          sink.event(t, t)
          this.token = window.requestAnimationFrame(nextFrame)
        }
        nextFrame()
      },
      dispose () {
        window.cancelAnimationFrame(this.token)
      }
    }
    return scheduler.asap(taskRequestFrame)
  }
}).multicast()
