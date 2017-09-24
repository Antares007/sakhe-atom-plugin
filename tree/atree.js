function ATree (deltac, pith) {
  const as = []
  const leaf = a => as.push(a)
  const node = (deltac, pith) => leaf(ATree(deltac, pith))
  pith(node, leaf)
  return deltac(as)
}

module.exports = ATree

if (require.main === module) {
  console.log(JSON.stringify(ATree(as => as, Sample())))
}

function Sample (stop = false) {
  return function (n, l) {
    l(1)
    n(as => as, function (n, l) {
      l('a')
      n(as => as, function (n, l) {
        l(true)
        if (!stop) n(as => as, Sample(true))
        l(false)
      })
      l('b')
    })
    l(2)
  }
}
