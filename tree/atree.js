function ATree (id) {
  return function bark (pith) {
    const as = []
    pith.call({ put: as.push.bind(as), node: pith => { as.push(bark(pith)) } })
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
    var [ret] = this.node(function () {
      this.put('a')
      this.node(function () {
        this.put(true)
        if (!stop) this.node(Sample(true))
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
      node: pith => {
        const rs = []
        this.node(addReturn(pith, rs))
        return rs
      },
      return: rs.push.bind(rs)
    }), args)
  }
}
