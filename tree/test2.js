const snabbdomBark = require('./snabbdom-bark2')
const m = require('most')

snabbdomBark(document.getElementById('root-node'), Me())
  .then((x) => console.log(x))

function Me (d = 3, w = 3) {
  return function mePith ({path, rootNode, $}) {
    path = path.join('-')
    this.put($.startWith('').map(x => h => h('div', {}, [
      h('button', {on: {click: path}}, path),
      h('code', {}, x.action)
    ])))
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        const elm = document.createElement('div')
        elm.setAttribute('id', 'node-' + path)
        elm.style.paddingLeft = '10px'
        this.node(elm, Me(d - 1, w))
      }
    }
  }
}
