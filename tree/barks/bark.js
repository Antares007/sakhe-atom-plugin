const m = require('most')
const ATree = require('../atree')
const $ = require('../$')

module.exports = Bark

function Bark (deltac, pmap) {
  const run = pith => ATree(deltac, (_, l) => pmap(pith)(a => l($(a))))
  return pith => {
    return (
      typeof pith === 'function'
      ? run(pith)
      : pith instanceof m.Stream
      ? pith.map(run).switchLatest()
      : m.throwError(new Error('invalid pith'))
    )
  }
}
