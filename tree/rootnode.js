// a :: ([a] -> b) -> [(a -> void), (void -> b)]
function a (f) {
  var as = []
  return [
    function g (a) { as.push(a) },
    function r () { const as_ = as; as = []; return f(as_) }
  ]
}

module.exports = rootNode

function rootNode (f, body) {
  const [g, r] = a(f)
  body(g)
  return r
}

if (require.main === module) {
  const identity = as => as
  const tree = rootNode(identity, g => {
    g(1)
    g(rootNode(identity, g => {
      g('a')
      g(rootNode(identity, g => {
        g(true)
        g(false)
      })())
      g('b')
    })())
    g(2)
  })()
  console.log(JSON.stringify(tree, null, '  '))
  // {
  //   "0": 1,
  //   "1": {
  //     "0": "a",
  //     "1": {
  //       "0": true,
  //       "1": false
  //     },
  //     "2": "b"
  //   },
  //   "2": 2
  // }
}
