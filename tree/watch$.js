const m = require('most')
const dispose = require('most/lib/disposable/dispose')
const fs = require('fs')
const promisify = require('./promisify')

const _stat = promisify(fs.stat.bind(fs))
const _readdir = promisify(fs.readdir.bind(fs))
const {join} = require('path')
const readdir = path => _readdir(path).then(names => Promise.all(
  names.map(name => _stat(join(path, name)).then((stat) => ({ name, stat })))
))

module.exports = path => watch$(path)
  .map(() => readdir(path))
  .startWith(readdir(path))
  .await()

function watch$ (path) {
  return new m.Stream({
    run (sink, scheduler) {
      const watcher = fs.watch(path)
      watcher.on('change', (eventType, filename) => {
        scheduler.asap(m.PropagateTask.event({eventType, filename}, sink))
      })
      watcher.once('error', (err) => {
        scheduler.asap(m.PropagateTask.error(err, sink))
      })
      return dispose.create(() => watcher.close())
    }
  })
}
