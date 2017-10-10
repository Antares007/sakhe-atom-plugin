// const m = require('most')
const debug = require('debug')
const watch$ = require('./watch$')
const {ReducerBark} = require('../barks/state')

const {join: pathJoin} = require('path')

const PatchBark = require('../barks/patch')
const cssRing = require('../rings/css')
const apiRing = require('../rings/api')

PatchBark(p => cssRing(apiRing(p)))(document.getElementById('root-node'))(
  Folder(pathJoin(__dirname, '../..'))
)
// .tap(x => x.log())
.drain()

// ReducerBark()()((enter, select) => {
//   enter.val('a', s => 'b')
// }).observe(debug('state'))

function Folder (path) {
  return (put, select) => {
    put.node(
      'ul',
      {style: select.css$` list-style-type: none; `},
      watch$(path).map(dir => (put, select) => {
        for (let name in dir) {
          let stat = dir[name]
          let epath = pathJoin(path, name)
          let actClose = [epath, false]
          let actOpen_ = [epath, true]
          const openClose$ = select.action$
            .filter(x => x.action === actClose || x.action === actOpen_)
            .map(x => x.action[1])
            .startWith(false)
          put.node('li', {key: name}, (put, select) => {
            if (stat.isDirectory()) {
              put.node('div', openClose$.map(op => (
                  op
                  ? put => {
                    put.node('button', {on: {click: actClose}}, put => put.text('- ' + name))
                    put.node('div', {}, Folder(epath))
                  }
                  : put => put.node('button', {on: {click: actOpen_}}, put => put.text('+ ' + name))
                ))
              )
            } else {
              put.text(name)
            }
          })
        }
      })
    )
  }
}
