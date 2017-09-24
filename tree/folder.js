const debug = require('debug') // eslint-disable-line
const css$ = require('./css$')
const m = require('most')
const {async: subject} = require('most-subject')
const {join: pathJoin} = require('path')
const watch$ = require('./watch$')
// const {hold} = require('@most/hold')
// const eq = (a, b) => a.length === b.length && !a.some((v, i) => b[i] !== v)
const toVnode = require('snabbdom/tovnode').default

const action$ = subject()
const h$ = require('./create-h$')(action$)
const state$ = subject()
const s$ = require('./create-s$')(state$)

const actionModule = require('../lib/drivers/snabbdom/actionModule')(function (event) {
  action$.next({ vnode: this, action: this.data.on[event.type], event })
})
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])

s$('root', s => {
  s(
    'vnode$',
    h$('div#root-node', {}, Folder(pathJoin(__dirname, '..'), s))
      .map(vnode => () => vnode)
  )
})
  .scan((s, r) => r(s), {})
  .tap(s => state$.next(s))
  .map(s => s.root).filter(Boolean)
  .map(s => s.vnode$).filter(Boolean)
  .reduce(patch, toVnode(document.getElementById('root-node')))

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
