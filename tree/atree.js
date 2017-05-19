function ATree (id) {
  return function bark (pith) {
    const as = []
    pith.call({ bark: pith => { as.push(bark(pith)) } }, as.push.bind(as))
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  const samplePith = (stop = false) => function pith (push, path) {
    console.log(path)
    push(1)
    this.bark(function (push, path) {
      console.log(path)
      push('a')
      this.bark(function (push, path) {
        console.log(path)
        push(true)
        if (!stop) this.bark(samplePith(true))
        push(false)
      })
      push('b')
    })
    push(2)
  }

  var bark = ATree(as => as)

  const mapPith = (f, pith) => f(pith)
  const tree = bark(mapPith(function addPathRay (pith, path = []) {
    return function (...args) {
      var i = 0
      pith.apply({
        bark: pith => {
          this.bark(addPathRay(pith, path.concat(i)))
          i++
        }
      }, args.concat([path]))
    }
  }, samplePith()))

  console.log(JSON.stringify(tree))
}
