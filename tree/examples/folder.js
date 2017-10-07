const m = require('most')
const {join: pathJoin} = require('path')
const watch$ = require('./watch$')

const PatchBark = require('../barks/patch')
const {ReducerBark} = require('../barks/state')

PatchBark()(document.getElementById('root-node'))(h => {
  h('div.app1', Folder(pathJoin(__dirname, '../..')))
})
  .debounce(100)
  // .tap(x => x.log(x))
  .drain()

  // size : 6148
  // mode : 33188
  // atime : Fri Sep 29 2017 17:08:08 GMT+0400 (GET)
  // birthtime : Thu Sep 28 2017 19:03:54 GMT+0400 (GET)
  // ctime : Thu Sep 28 2017 19:18:03 GMT+0400 (GET)
  // mtime : Thu Sep 28 2017 19:18:03 GMT+0400 (GET)
  //  isDirectory

function Folder (path, s) {
  return h => {
    h(
      'ul',
      {style: h.css$` list-style-type: none; `},
      ReducerBark(a => a)()(({obj, arr, val, select}) => {
        val(
          'pith',
          watch$(path).take(1)
            .map(entries => Entries(path, entries))
            .flatMapError(err => m.of(h => h('li', {}, h => h(err.message))))
            .map(pith => s => pith)
        )
      }).tap(console.info.bind(console)).map(s => s.pith).filter(Boolean)
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
