const m = require('most')
const rootNode = require('./rootnode')
const identity = as$ => m.combineArray((...as) => as, as$)
const tree$ = rootNode(identity, g => {
  g(m.from([1, 2, 3]))
  g(rootNode(identity, g => {
    g(m.of('a'))
    g(rootNode(identity, g => {
      g(m.of(true))
      g(m.of(false))
    })())
    g(m.of('b'))
  })())
  g(m.from([3, 2, 1]))
})()
tree$.observe(tree => console.log(JSON.stringify(tree)))
