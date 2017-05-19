function ATree (id) {
  return function bark (pith) {
    const as = []
    pith(as.push.bind(as), pith => as.push(bark(pith)))
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  const samplePith = (stop = false) => function pith (push, bark) {
    push(1)
    bark(function (push, bark) {
      push('a')
      bark(function (push, bark) {
        push(true)
        if (!stop) bark(samplePith(true))
        push(false)
      })
      push('b')
    })
    push(2)
  }

  var bark = ATree(as => as)
  const tree = bark(samplePith())

  console.log(JSON.stringify(tree))
}
