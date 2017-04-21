window.addEventListener('DOMContentLoaded', () => {
  const root = new window.URL(document.location).searchParams.get('root')
  try {
    const path = require.resolve(root)
    const exports = require(path)
    if (typeof exports === 'function') {
      const most = require('most')
      const run = require('./run.js')
      const rootModule = require('module')._cache[path]
      const trinity = require('./drivers')(rootModule.require.bind(rootModule))
      const makeEmitterDriver = require('./drivers/makeEmitterDriver.js')
      const makeSnabbdomDriver = require('./drivers/snabbdom')
      const rootElm = document.getElementById('root-node')
      run(
        function (sources) {
          return exports.call(most, sources)
        },
        Object.assign({}, trinity, {
          Window: makeEmitterDriver(() => window, (win) => void 0),
          DOM: makeSnabbdomDriver(rootElm)
        })
      )().sinks$.drain()
      window.addEventListener('keydown', (e) => {
        if (e.altKey && e.metaKey && e.code === 'KeyI') {
          require('electron').remote.getCurrentWindow().openDevTools()
        }
      })
    }
  } catch (error) {
    console.error('Unable to load preload script: ' + root)
    console.error(error.stack || error.message)
  }
})
