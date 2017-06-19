const ATree = require('./atree')
const {h} = require('snabbdom')
const m = require('most')

module.exports = VNodeBark

function VNodeBark (sd$, pith) {
  return ATree(sdc$s => sd$.map(
    ([sel, data]) => children => h(sel, data, children)
  ).ap(
    m.combineArray(
      (...args) => args,
      sdc$s.map((sdc$, key) => sdc$)
    )
  ))((function map (pith) {
    return function (put) {
      var i = 0
      pith(sdc$ => put(sdc$.map(([s, d, c]) => {
        d.key = i++
        return h(s, d, c)
      })))
    }
  }(pith)))
}

function H (s, d, pith) {
  const cmb$ = (...args) => m.combineArray(
    (...array) => array,
    args.map(a => a && a.source ? a : m.of(a))
  )
  return VNodeBark(cmb$(s, d), (function map (pith) {
    return function (put) {
      pith((s, d, c) => put(
        typeof c === 'function'
        ? H(s, d, c).map(vnode => [vnode.sel, vnode.data, vnode.children])
        : cmb$(s, d, c)
      ))
    }
  }(pith)))
}

const SnabbdomBark = require('./snabbdom-bark')

SnabbdomBark(document.getElementById('root-node'), function (put) {
  put(
    H('div.a', {}, h => {
      h('h1', {}, 'hi3')
      h('div.b', {}, h => {
        h('h2', {}, 'hi4')
      })
    })
  )
  put(H('div', {}, Tree(3, 2)))
})

function Tree (d = 4, w = 2) { //eslint-disable-line
  return (h) => {
    h('button', {}, 'path')
    // h('span', {}, $.map(x => x.action).startWith(''))
    for (var i = 0; i < w; i++) {
      if (d > 0) h('div', {style: {paddingLeft: '20px'}}, Tree(d - 1, w))
    }
  }
}
