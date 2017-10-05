const ATree = (pmap = a => a) => deltac => pith => {
  const as = []
  const push = a => as.push(a)
  const pull = () => as.pop()
  pmap(pith)(push, pull)
  return deltac(as)
}

module.exports = ATree

// const rez = ATree()(a => a)((push, pop) => {
//   push(1)
//   push(ATree()(a => a)((push, pop) => {
//     push(1)
//     pop()
//     push(1.1)
//   }))
//   push(2)
// })
// console.log(rez)
