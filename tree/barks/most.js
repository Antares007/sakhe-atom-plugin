const m = require('most')
const aTree = require('../atree')

const mostBark = pmap => deltac => pith => {
  const run = pith => aTree(deltac)(function mPith ({push, pull}) {
    pmap(pith)({
      put: a => push(a)
    }, {$})
  })
  return (
    typeof pith === 'function'
    ? run(pith)
    : pith instanceof m.Stream
    ? pith.map(run).switchLatest()
    : m.throwError(new Error('invalid pith'))
  )
}

module.exports = mostBark

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
