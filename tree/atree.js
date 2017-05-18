function ATree (id) {
  return function bark (pith) {
    const as = []
    pith.call({ bark: pith => { as.push(bark(pith)) } }, as.push.bind(as))
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  const samplePith = (stop = false) => function pith (push) {
    push(1)
    this.bark(function (push) {
      push('a')
      this.bark(function (push) {
        push(true)
        // if (!stop) this.bark(samplePith(true))
        push(false)
      })
      push('b')
    })
    push(2)
  }

  var bark = ATree(as => as)

  const mapPith = (f, pith) => f(pith)

  const tree = bark(mapPith(function ring (pith) {
    return function (push, ...rest) {
      pith.apply({
        bark: pith => this.bark(ring(pith))
      }, [a => push([a, a]), ...rest])
    }
  }, samplePith()))

  console.log(JSON.stringify(tree))
}
