const snabbdomBark = require('./snabbdom-bark')
const m = require('most')
const fs = require('fs')
const hf$Bark = require('./hf$-bark')

const a$ = af => (...args) => m.fromPromise(new Promise(
  (resolve, reject) => af(...args, (err, e) => err ? reject(err) : resolve(e))
))

// function ObjectView (o) {
//   return function ObjectViewPith () {
//     this.put(m.of(h =>
//       h('h1', {}, 'hello!!!')
//     ).merge(m.never()))
//   }
// }
function Entries (cpath, entries) {
  return function () {
    this.put(m.of(h =>
      h('ul', {}, entries.map(({name, stat}) => h('li', [
        h('span', {}, name),
        h('code', {}, JSON.stringify(stat, null, '  '))
      ])))
    ).merge(m.never()))
  }
}

function Folder (cpath = '.') { // eslint-disable-line
  return function folderPith ({path, $}) {
    const entries$ = a$(fs.readdir)(cpath).flatMap(function (names) {
      const stat$s = names.map(function (name) {
        return a$(fs.stat)(cpath + '/' + name).map(function (stat) {
          return {name, stat}
        })
      })
      return m.combineArray((...args) => args, stat$s)
    })
    this.put(
      entries$.map(entries =>
        hf$Bark(
          path.split('/'),
          $,
          m.of(h => h('div.nested', {})),
          Entries(cpath, entries)
        )
      ).switchLatest()
    )
  }
}

snabbdomBark(document.getElementById('root-node'), Folder())
