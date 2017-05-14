window.addEventListener('DOMContentLoaded', () => {
  const root = new window.URL(document.location).searchParams.get('root')
  try {
    const path = require.resolve(root)
    const exports = require(path)
    if (typeof exports === 'function' && exports.name === 'main') {
      exports(require('./drivers/snabbdom')(document.getElementById('root-node')))
    }
  } catch (error) {
    throw new Error(error.stack)
    console.error(error.stack || error.message)
  }
})

window.addEventListener('keydown', (e) => {
  if (e.altKey && e.metaKey && e.code === 'KeyI') {
    require('electron').remote.getCurrentWindow().openDevTools()
  }
})
