const debug = require('debug') // eslint-disable-line
const css$ = require('./css$')
const m = require('most')
const mount = require('./mount')
const {join} = require('path')
const watch$ = require('./watch$')

const elm = document.getElementById('root-node')
mount(elm, Folder(__dirname.slice(0, __dirname.lastIndexOf('/'))))

function Folder (path, state = {}) {
  return h => {
    h.$.map(x => x.action).scan((s, [path, isOpen]) => {
      s[path] = isOpen
      return s
    }, state)
      .tap(debug(path))
      .drain()
    const entries$ = watch$(path).map(entrs => entrs.map(
      ({name, stat}) => ({ name, isDir: stat.isDirectory(), path: join(path, name) })
    ))
    h(
      'ul',
      {style: css$` list-style-type: none; `},
      entries$
        .map(entries => Entries(entries, state))
        .flatMapError(err => m.of(h => h('li', h => h(err.message))))
        .startWith(h => h('li', h => h('Loading...')))
    )
  }
}

function Entries (entries, state) {
  return h => {
    for (let i = 0; i < entries.length; i++) {
      let actClose = [entries[i].path, false]
      let actOpen_ = [entries[i].path, true]
      const openClose$ = h.$
        .filter(x => x.action === actClose || x.action === actOpen_)
        .map(x => x.action[1])
        .startWith(!!state[entries[i].path])
      h(
        'li',
        entries[i].isDir
        ? h => h(
          'div',
          openClose$.map(op => (
            op
            ? h => {
              h('button', {on: { click: actClose }}, h => h('-' + entries[i].name))
              h('div', {}, Folder(entries[i].path, state))
            }
            : h => h('button', {on: { click: actOpen_ }}, h => h('+ ' + entries[i].name))
          ))
        )
        : h => h(entries[i].name)
      )
    }
  }
}
