console.log('hmm')
if (process.type === 'browser') {
  const {app} = require('electron')
  const {BrowserWindow} = require('electron')
  const path = require('path')
  app.on('ready', () => {
    console.log(
      BrowserWindow.addDevToolsExtension(
        path.join(__dirname, '../devTool')
      )
    )
    const bw = new BrowserWindow()
    bw.loadURL('about:blank')
    bw.webContents.openDevTools()
  })
} else {
  const { CompositeDisposable } = require('atom')
  module.exports = {
    subscriptions: null,

    activate (state) {
      console.log('activate:', state)
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
      return { hello: 'world' }
    },
    run (path) {
      console.log('run(' + path + ')')
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
}
// const events = `did-finish-load, did-fail-load,
// did-frame-finish-load, did-start-loading, did-stop-loading,
// did-get-response-details, did-get-redirect-request, dom-ready,
// page-favicon-updated, new-window, will-navigate, did-navigate,
// did-navigate-in-page, crashed, plugin-crashed, destroyed,
// before-input-event, devtools-opened, devtools-closed,
// devtools-focused, certificate-error, select-client-certificate,
// login, found-in-page, media-started-playing, media-paused,
// did-change-theme-color, update-target-url, cursor-changed,
// context-menu, select-bluetooth-device, paint,
// devtools-reload-page, will-attach-webview`.split(/,| |\n/).filter(Boolean)
// events.forEach((name) => bw.webContents.on(name, () => console.log(name)))
