const m = require('most')
const $ = require('./$')
const ATree = require('./atree')

module.exports = ATree$

function ATree$ (deltac, pith) {
  return m.combine(
    (deltac, pith) => ATree(
      deltac,
      function (node, leaf) {
        pith(
          (deltac, pith) => leaf(ATree$(deltac, pith)),
          x => leaf($(x))
        )
      }
    ),
    $(deltac),
    $(pith)
  ).switchLatest()
}
