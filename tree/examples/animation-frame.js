const dispose = require('most/lib/disposable/dispose')
const { Stream } = require('most')

module.exports = new Stream({
  run (sink, scheduler) {
    var disposable
    const nextFrame = () => {
      disposable = scheduler.asap({
        run (t) {
          console.timeStamp('Frame Event')
          sink.event(t, t)
          this.token = window.requestAnimationFrame(nextFrame)
        },
        dispose () {
          window.cancelAnimationFrame(this.token)
        }
      })
    }
    nextFrame()
    return dispose.create(() => disposable.dispose())
  }
})
