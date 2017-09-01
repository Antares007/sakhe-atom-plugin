const debug = require('debug') // eslint-disable-line
const css$ = require('./css$')
const m = require('most')
const mount = require('./mount')
const {join} = require('path')
const watch$ = require('./watch$')
const {hold} = require('@most/hold')
const eq = (a, b) => a.length === b.length && !a.some((v, i) => b[i] !== v)

mount(document.getElementById('root-node'), Folder(join(__dirname, '..')))

function Folder (path) {
  return h => {
    const state = {}
    h.$.map(x => x.action).scan((s, [path, isOpen]) => {
      s[path] = isOpen
      return s
    }, state).drain()
    FolderRec(path, state)(h)
  }
}

function FolderRec (path, state) {
  return h => {
    const change$ = hold(watch$(path))
    const entry$ = (name) =>
      change$
        .filter(([p, c]) => p[name] || c[name])
        .map(([p, c]) => [p[name], c[name]])
    change$
      .filter(([prev, curr]) => !eq(Object.keys(prev), Object.keys(curr)))
      .map(([prev, curr]) => {

      })

    const entries$ = hold(watch$(path))
      .map(([prev, curr]) => Object.keys(curr).map(name => ({name, stat: curr[name]})))
      .map(entrs => entrs.map(
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
      let {path, name, isDir} = entries[i]
      let actClose = [path, false]
      let actOpen_ = [path, true]
      const openClose$ = h.$
        .filter(x => x.action === actClose || x.action === actOpen_)
        .map(x => x.action[1])
        .startWith(!!state[path])
      h(
        'li',
        isDir
        ? h => h(
          'div',
          openClose$.map(op => (
            op
            ? h => {
              h('button', {on: {click: actClose}}, h => h('- ' + name))
              h('div', {}, FolderRec(path, state))
            }
            : h => h('button', {on: {click: actOpen_}}, h => h('+ ' + name))
          ))
        )
        : h => h(name)
      )
    }
  }
}
