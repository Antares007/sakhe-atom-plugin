const Module = require('module')
const most = require('most')
const log = require('debug')('require.js')

class RequireSource {
  constructor (module$) {
    this.module$ = module$.multicast()
  }
  isolateSource (source, scope) {
    return new RequireSource(this.module$.filter(({scopes}) => scopes.indexOf(scope) >= 0))
  }
  isolateSink (sink, scope) {
    return sink.map(
      (x) => typeof x === 'string'
        ? { request: x, scopes: [scope] }
        : { request: x.request, scopes: x.scopes.concat(scope) }
      )
  }
}

module.exports = function makeRequireDriver (require) {
  return function (request$) {
    const module$ = request$.map(function (x) {
      const {scopes, request} = typeof x === 'string' ? {scopes: [], request: x} : x
      return {
        request,
        exports$: most.of(request).map((request) => {
          const rez = resolveRequest(request, require)
          return rez
        }),
        scopes
      }
    }).tap(log)
    return new RequireSource(module$)
  }
}

function resolveRequest (request, require) {
  const oldRequire = Module.prototype.require
  Module.prototype.require = function (request) {
    const filename = Module._resolveFilename(request, this, false)
    const exports = oldRequire.call(this, filename)
    return exports
  }
  try {
    return require(request)
  } finally {
    Module.prototype.require = oldRequire
  }
}
