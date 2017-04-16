var _scope = 0
module.exports = function (main) {
  return function (sources) {
    var scope = _scope++
    const isolatedSources = Object.keys(sources).reduce(function (s, n) {
      const source = sources[n]
      s[n] = source.isolateSource
        ? source.isolateSource(source, scope)
        : source
      return s
    }, {})
    const sinks = main(isolatedSources)
    const isolatedSinks = Object.keys(sinks).reduce(function (s, n) {
      const source = sources[n]
      s[n] = source && source.isolateSink
        ? source.isolateSink(sinks[n], scope)
        : sinks[n]
      return s
    }, {})
    return isolatedSinks
  }
}
