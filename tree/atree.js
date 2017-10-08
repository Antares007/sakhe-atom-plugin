const aTree = deltac => pith => {
  const as = []
  const push = a => as.push(a)
  const pull = () => as.pop()
  pith({push, pull})
  return deltac(as)
}

module.exports = aTree

// const rez = aTree()(a => a)(({push, pull: pop}) => {
//   push(1)
//   push(aTree()(a => a)(({push, pull: pop}) => {
//     push(1)
//     pop()
//     push(1.1)
//   }))
//   push(2)
// })
// console.log(rez)
