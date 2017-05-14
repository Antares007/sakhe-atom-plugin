module.exports = function Driver (SourceType, SinkType, [cb, $]) {
  const source = new SourceType($)
  const sink = new SinkType(cb)
  return isolate(void 0, source, sink)
}
function isolate (scope, source, sink) {
  return {
    source: scope && source.isolate ? source.isolate(scope) : source,
    sink: sink && sink.isolate ? sink.isolate(scope) : sink,
    isolate: (scope) => isolate(scope, source, sink)
  }
}
