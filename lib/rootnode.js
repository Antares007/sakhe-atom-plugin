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

module.exports = function RootNode (body, f, driver, isolateSink = $ => $, isolateSource = $ => $) {
  const [g, r] = a(f)
  var i = 0
  const $ = driver(() => r())
  const node = (body, f, $) => {
    const scope = 's' + i++
    const [g, r] = a(f)
    body.call({
      node: (body, f) => {
        const b = node(body, f, $)()
        if (b) g(b)
      }
    }, [($) => g(isolateSink($, scope)), isolateSource($, scope)])
    return r
  }

  body.call({
    node: (body, f) => {
      const b = node(body, f, $)()
      if (b) g(b)
    }
  }, [g, $])
}
