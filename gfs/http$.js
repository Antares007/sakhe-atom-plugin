const http = require('http')
const m = require('most')

module.exports = (port) => new m.Stream({
  run (sink, scheduler) {
    return scheduler.asap({
      run (t) {
        this.s = http.createServer(function (req, res) {
          sink.event(scheduler.now(), [req, res])
        })
        this.s.listen(port)
      },
      error (t, err) {
        sink.error(t, err)
      },
      dispose () {
        this.s.close()
      }
    })
  }
})
