const m = require('most')

module.exports = function $ (x) {
  return (
    x instanceof m.Stream
      ? x
      : x && typeof x === 'object' && Object.keys(x).some(key => x[key] instanceof m.Stream)
        ? m.combineArray(function () {
          return Object.keys(x).reduce((s, key, i) => {
            s[key] = arguments[i]
            return s
          }, {})
        }, Object.keys(x).map(key => $(x[key])))
        : m.of(x)
  )
}
