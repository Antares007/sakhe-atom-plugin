// a :: ([a] -> b) -> [(a -> void), (void -> b)]
function a (f) {
  var $s = []
  return [
    // $ -> void
    function g ($) {
      $s.push($)
    },
    // void -> $
    function r () {
      const c = $s
      $s = []
      return f(c)
    }
  ]
}

module.exports = function RootNode (body, f, driver) {
  const [g, r] = a(f)
  const $ = driver(() => r())
  const node = (body, f, $) => {
    const [g, r] = a(f)
    body.call({
      node: (body, f) => {
        const b = node(body, f, $)()
        if (b) g(b)
      }
    }, [g, $])
    return r
  }

  body.call({
    node: (body, f) => {
      const b = node(body, f, $)()
      if (b) g(b)
    }
  }, [g, $])
}
