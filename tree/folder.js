const debug = require('debug') // eslint-disable-line
const css$ = require('./css$')
const m = require('most')
const mount = require('./mount')
const {join} = require('path')
const watch$ = require('./watch$')

const elm = document.getElementById('root-node')
mount(elm, Folder('/'))

function Folder (path) {
  return h => {
    h.$.map(x => x.action).observe(debug(path))
    const entries$ = watch$(path).map(entrs => entrs.map(
      ({name, stat}) => ({ name, isDir: stat.isDirectory(), path: join(path, name) })
    ))
    h(
      'ul',
      {style: css$` list-style-type: none; `},
      entries$
        .map(Entries)
        .flatMapError(err => m.of(h => h('li', h => h(err.message))))
        .startWith(h => h('li', h => h('Loading...')))
    )
  }
}

function Entries (entries) {
  return h => {
    for (let i = 0; i < entries.length; i++) {
      let actClose = 'close ' + entries[i].path
      let actOpen = 'open  ' + entries[i].path
      const openClose$ = m.merge(
        h.$.filter(x => x.action === actClose).constant(false),
        h.$.filter(x => x.action === actOpen).constant(true)
      ).startWith(false)
      h(
        'li',
        entries[i].isDir
        ? h => h(
          'div',
          openClose$.map(op => (
            op
            ? h => {
              h('button', {on: { click: actClose }}, h => h('-' + entries[i].name))
              h('div', {}, Folder(entries[i].path))
            }
            : h => h('button', {on: { click: actOpen }}, h => h('+ ' + entries[i].name))
          ))
        )
        : h => h(entries[i].name)
      )
    }
  }
}
