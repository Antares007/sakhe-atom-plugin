function ATree (id) {
  return function ring (pith) {
    const as = []
    pith.call({ ring: pith => { as.push(ring(pith)) } }, a => as.push(a))
    return id(as)
  }
}

module.exports = ATree

if (require.main === module) {
  var ring = ATree(as => as)
  console.log(JSON.stringify(ring(SampleTree()), null, '  '))
}
function SampleTree (stop = false) {
  return function pith (push) {
    push(1)
    push(ring(function (push) {
      push('a')
      push(ring(function (push) {
        push(true)
        if (!stop) push(ring(SampleTree(true)))
        push(false)
      }))
      push('b')
    }))
    push(2)
  }
}
