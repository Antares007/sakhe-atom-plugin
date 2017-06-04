function ATree (id) {
  return function bark (pith) {
    var as = []
    pith.call({
      put: a => {
        as = as.concat(a)
      },
      node: pith => {
        as = as.concat([ bark(pith) ])
      }
    })
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  var bark = ATree(as => as)
  const tree = bark(addReturn(Sample()))
  const m = require('most')
  const tree2 = ATree(
    as => m.combineArray((...args) => args, as)
  )(
    (function map (pith) {
      return function () {
        pith.call({
          put: x => this.put(m.of(x)),
          node: pith => {
            this.node(map(pith))
          }
        })
      }
    }(Sample()))
  )
  console.log(JSON.stringify(tree))
  tree2.observe(x => console.log(JSON.stringify(x)))
}

function Sample (stop = false) {
  return function () {
    this.put(1)
    this.node(function () {
      this.put('a')
      this.node(function () {
        this.put(true)
        if (!stop) this.node(Sample(true))
        this.put(false)
      })
      this.put('b')
    })
    this.put(2)
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
