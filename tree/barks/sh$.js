// const $ = require('../$')
const H$ = require('./h$')
const {ObjectBark} = require('./state')
const {nil} = require('../list')
const id = a => a
// const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const SH$ = (pmap = id) => (sel, data = {}, path = nil) =>
  ObjectBark(function map (pith) {
    return (obj, arr, val) => {
      const pith2 = pmap(pith)(obj, arr, val)
      val('vnode$', s => H$()(sel, data, path)(pith2))
    }
  })

module.exports = SH$

SH$()('div')((obj, arr, val) => {
  val('k', s => '42')
  return (elm, txt, vnode, path) => {
    txt('hi')
  }
})
  .scan((s, r) => r(s)).skip(1)
  .observe(x => console.log(x))
