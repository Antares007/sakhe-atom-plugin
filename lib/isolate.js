var scope = 0
module.exports = function (main, customScope) {
  return ((scope) => function isolate (sources) {
    const isolatedSources = Object.keys(sources).reduce(function (s, n) {
      const source = sources[n]
      s[n] = typeof source.isolateSource === 'function'
        ? source.isolateSource(source, scope)
        : source
      return s
    }, {})
    const sinks = main(isolatedSources)
    const isolatedSinks = Object.keys(sinks).reduce(function (s, n) {
      const source = sources[n]
      s[n] = source && typeof source.isolateSink === 'function'
        ? source.isolateSink(sinks[n], scope)
        : sinks[n]
      return s
    }, {})
    return isolatedSinks
  })(customScope || 'scope-' + scope++)
}
