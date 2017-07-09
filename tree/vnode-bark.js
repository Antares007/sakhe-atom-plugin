const ATree = require('./atree')
const m = require('most')
const h = require('snabbdom').h
const {Cons, nil} = require('./list')

module.exports = H

function H (sel, data, pith, path = nil) {
  var i = 0
  return $(pith).map(pith => ATree(
    vnode$s => m.combine(function (sel, data, ...children) {
      data.key = path.head
      data.path = path
      return h(sel, data, children)
    }, $(sel), $(data), ...vnode$s),
    push => (sel, data, pith) => {
      if (sel && data && pith) {
        push(H(sel, data, pith, Cons(i++, path)))
      } else {
        push($(sel))
      }
    },
    h => pith(h, path)
  )).switchLatest()
}

function $ (x) {
  return (
    x instanceof m.Stream
    ? x
    : x && typeof x === 'object' && Object.keys(x).some(key => x[key] instanceof m.Stream)
    ? m.combineArray(function () {
      return Object.keys(x).reduce((s, key, i) => {
        s[key] = arguments[i]
        return s
      }, {})
    }, Object.keys(x).map(key => $(x[key])))
    : m.of(x)
  )
}
