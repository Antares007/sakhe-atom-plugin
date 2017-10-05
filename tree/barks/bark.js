const m = require('most')
const $ = require('../$')
const ATree = require('../atree')

const Bark = pmap => deltac => pith => {
  const run = ATree(pith => push => pmap(pith)(a => push($(a))))(deltac)
  return (
    typeof pith === 'function'
    ? run(pith)
    : pith instanceof m.Stream
    ? pith.map(run).switchLatest()
    : m.throwError(new Error('invalid pith'))
  )
}

module.exports = Bark
