const m = require('most')
const dispose = require('most/lib/disposable/dispose')
const fs = require('fs')
const promisify = require('./promisify')

const _stat = promisify(fs.stat.bind(fs))
const _readdir = promisify(fs.readdir.bind(fs))
const {join} = require('path')

const readdir = path => _readdir(path).then(names => {
  const s = {}
  const stats = names.map(
    name => _stat(join(path, name))
              .then(stat => { s[name] = stat })
  )
  return Promise.all(stats).then(() => s)
})

// // pairwise :: a -> Stream a -> Stream (a, a)
// const pairwise = (initial, stream) => m.loop(
//   (prev, current) => ({ seed: current, value: [prev, current] }),
//   initial,
//   stream
// )

class WatchSource {
  constructor (path) {
    this.path = path
  }
  run (sink, scheduler) {
    const path = this.path
    const watcher = fs.watch(path)
    return dispose.all([
      dispose.create(() => watcher.close()),
      m.fromEvent('change', watcher)
        .map(() => readdir(path))
        .startWith(readdir(path))
        .await()
        .merge(m.fromEvent('error', watcher)
          .take(1)
          .flatMap(err => m.throwError(err))).source.run(sink, scheduler)
    ])
  }
}

module.exports = path => new m.Stream(new WatchSource(path))
