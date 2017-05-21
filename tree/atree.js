function ATree (id) {
  return function bark (pith) {
    const as = []
    pith.call({ put: as.push.bind(as), bark: pith => { as.push(bark(pith)) } })
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  var bark = ATree(as => as)
  const tree = bark(addReturn(Sample()))
  console.log(JSON.stringify(tree))
}

function Sample (stop = false) {
  return function () {
    this.put(1)
    var [ret] = this.bark(function () {
      this.put('a')
      this.bark(function () {
        this.put(true)
        if (!stop) this.bark(Sample(true))
        this.put(false)
      })
      this.put('b')
      this.return(2)
    })
    this.put(ret)
  }
}

function addReturn (pith, rs = []) {
  return function (...args) {
    pith.apply(Object.assign({}, this, {
      bark: pith => {
        const rs = []
        this.bark(addReturn(pith, rs))
        return rs
      },
      return: rs.push.bind(rs)
    }), args)
  }
}
