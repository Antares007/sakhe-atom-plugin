const { CompositeDisposable } = require('atom')
module.exports = {
  subscriptions: null,

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(global.atom.commands.add('atom-workspace', {
      'sakhe:toggle': () => {
        var editor = global.atom.workspace.getActiveTextEditor()
        if (editor) {
          editor.save()
          this.run(editor.getPath())
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
