function ATree (id) {
  return function bark (pith) {
    const as = []
    pith({put: as.push.bind(as), bark: pith => as.push(bark(pith))})
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  var bark = ATree(as => as)
  const tree = bark(Sample())
  console.log(JSON.stringify(tree))
}

function Sample (stop = false) {
  return ({put, bark}) => {
    put(1)
    bark(({put, bark}) => {
      put('a')
      bark(({put, bark}) => {
        put(true)
        if (!stop) bark(Sample(true))
        put(false)
      })
      put('b')
    })
    put(2)
  }
}
