'use babel'
import { CompositeDisposable } from 'atom'

export default {
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
    return { hello: 'world' }
  },
  run (path) {
    console.log('run(' + path + ')')
    var {BrowserWindow, getCurrentWindow} = require('electron').remote
    var bw = new BrowserWindow({
      width: 1200,
      height: 800,
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
