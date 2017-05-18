const ATree = require('./atree')
const {combineArray} = require('most')
const Type = (is, coerce) => ({
  is,
  validate (x) { if (!is(x)) throw TypeError(is.toString()) },
  coerce (x) { return is(x) ? x : (coerce ? coerce.call(this, x) : this.validate(x)) }
})
const $Type = (type) => ({
  is ($) { return $.map(type.is) },
  validate ($) { return $.tap(type.validate) },
  coerce ($) { return $.map(type.coerce.bind(type)) }
})
const vdomType = Type(
  x => !!(x && typeof x.sel === 'string'),
  x => ({sel: 'div', data: {}, text: x + ''})
)
const functionType = Type(x => typeof x === 'function')
const vdom$Type = $Type(vdomType)
const function$Type = $Type(functionType)

const bark = ATree(
  ([head, ...tail]) =>
    vdom$Type.validate(
      function$Type.validate(head)
        .ap(combineArray((...vnodes) =>
          vnodes.map((vnode, i) => Object.assign({}, vnode, {key: i})),
          tail.map(vdom$Type.coerce)
        ))
    )
)
module.exports = bark

// const {h} = require('snabbdom')
// const m = require('most')
// bark(function (push) {
//   push(m.of((childs) => h('div', childs)))
//   push(m.of(h('div', 'hi3')))
// }).observe(console.log.bind(console))
