const debug = require('debug') // eslint-disable-line
const css$ = require('./css$')
const m = require('most')
const {join: pathJoin} = require('path')
const watch$ = require('./watch$')

const MountBark = require('../barks/mount')

MountBark(function (r, m) {
  m(document.getElementById('root-node'), Folder(pathJoin(__dirname, '../..')))
}).throttle(1000)
  .tap(console.log.bind(console))
  .drain()

function Folder (path, s) {
  return h => {
    h(
      'ul',
      {style: css$` list-style-type: none; `},
      watch$(path).take(1)
        .map(([p, c]) => c)
        .map(entries => Entries(path, entries))
        .flatMapError(err => m.of(h => h('li', {}, h => h(err.message))))
    )
  }
}

function Entries (basePath, entries) {
  return h => {
    for (let name in entries) {
      let path = pathJoin(basePath, name)
      let isDir = entries[name].isDirectory()
      let actClose = [path, false]
      let actOpen_ = [path, true]
      const openClose$ = h.$
        .filter(x => x.action === actClose || x.action === actOpen_)
        .map(x => x.action[1])
        .startWith(false)
      h(
        'li',
        {key: name},
        isDir
        ? h => h(
          'div',
          openClose$.map(op => (
            op
            ? h => {
              h('button', {on: {click: actClose}}, h => h('- ' + name))
              h('div', {}, Folder(path))
            }
            : h => h('button', {on: {click: actOpen_}}, h => h('+ ' + name))
          ))
        )
        : h => h(name)
      )
    }
  }
}
