function ATree (deltac, fmap, pith) {
  var as = []
  pith(fmap(as.push.bind(as)))
  return deltac(as)
}

module.exports = ATree

if (require.main === module) {
  var bark = pith => ATree(as => as, f => f, pith)
  const tree = bark(Sample())
  console.log(JSON.stringify(tree))
}

function Sample (stop = false) {
  return function (put) {
    put(1)
    put(bark(function (put) {
      put('a')
      put(bark(function (put) {
        put(true)
        if (!stop) put(bark(Sample(true)))
        put(false)
      }))
      put('b')
    }))
    put(2)
  }
}
