function ATree (id) {
  return function bark (pith) {
    const as = []
    pith(as.push.bind(as), pith => as.push(bark(pith)))
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
  return (push, bark) => {
    push(1)
    bark(function (push, bark) {
      push('a')
      bark(function (push, bark) {
        push(true)
        if (!stop) bark(Sample(true))
        push(false)
      })
      push('b')
    })
    push(2)
  }
}
