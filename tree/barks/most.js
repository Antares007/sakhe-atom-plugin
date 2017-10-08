const m = require('most')
const $ = require('../$')
const ATree = require('../atree')

const mostBark = pmap => deltac => pith => {
  const run = ATree(
    pith => function mPith ({push, pull}) {
      pmap(pith)({
        put (a) { push($(a)) }
      })
    })(deltac)
  return (
    typeof pith === 'function'
    ? run(pith)
    : pith instanceof m.Stream
    ? pith.map(run).switchLatest()
    : m.throwError(new Error('invalid pith'))
  )
}

module.exports = mostBark
