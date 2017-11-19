const { CompositeDisposable } = require('atom')
const { join, basename } = require('path')
const findJsPath = require('./findjspath')
module.exports = {
  subscriptions: null,

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(global.atom.commands.add('atom-workspace', {
      'sakhe:toggle': () => {
        var editor = global.atom.workspace.getActiveTextEditor()
        if (editor) {
          const path = editor.getPath()
          if (!path) return
          editor.save()
          if (path.endsWith('.ts')) {
            findJsPath(path).then(this.run)
              .catch(console.error.bind(console))
          } else {
            this.run(path)
          }
        }
      }
    }))
  },
  deactivate () {
    this.subscriptions.dispose()
  },
  serialize () {
    return {}
  },
  run (path) {
    var {BrowserWindow, getCurrentWindow} = require('electron').remote
    var {x, y} = getCurrentWindow().getBounds()
    var iv = document.querySelector('atom-workspace-axis.vertical .panes .item-views')
    var r = iv.getClientRects().item(0)
    var [px, py] = [r.left, r.top]
    var bw = new BrowserWindow({
      x: px + x,
      y: py + y,
      width: r.width,
      height: r.height,
      parent: getCurrentWindow(),
      webPreferences: {
        preload: require('path').join(__dirname, 'pre.js')
      }
    })
    bw.loadURL(
      'file://' +
      require('path').join(__dirname, 'blank.html') +
      '?root=' +
      encodeURIComponent(path)
    )
    bw.webContents.openDevTools()
  }
}
