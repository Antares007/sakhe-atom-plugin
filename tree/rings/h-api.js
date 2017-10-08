const $ = require('../$')
const cssRing = require('../rings/css')

const hApiRing = pith => cssRing((put, select) => {
  const h = (...args) => (
    args.length === 1
    ? put.text($(args[0]).map(a => a + ''))
    : args.length === 2
    ? put.element(p => hApiRing(p))(args[0], {})(args[1])
    : args.length === 3
    ? put.element(p => hApiRing(p))(args[0], args[1])(args[2])
    : put.text('h args error ' + JSON.stringify(args))
  )
  h.vnode = put.vnode
  h.$ = select.action$
  h.path = put.path
  h.css$ = select.css$
  h.ring = hApiRing
  pith(h)
})

module.exports = hApiRing
