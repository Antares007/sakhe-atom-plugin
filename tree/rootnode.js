function A (f) {
  return function a (heart) {
    const as = []
    heart.call({ node: heart => { as.push(a(heart)) } }, as.push.bind(as))
    return f(as)
  }
}

module.exports = A

if (require.main === module) {
  console.log(A(as => as)(heart))
  console.log(A(as => Object.assign({}, as))(heart))
}

function heart (push) {
  push(1)
  this.node(function (push) {
    push('a')
    this.node(function (push) {
      push(true)
      push(false)
    })
    push('b')
  })
  push(2)
}
