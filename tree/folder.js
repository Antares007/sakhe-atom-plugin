const debug = require('debug') // eslint-disable-line
const css$ = require('./css$') // eslint-disable-line
const m = require('most')
const mount = require('./mount')
const fs = require('fs')
const promisify = f => (...args) => new Promise(
  (resolve, reject) => f(
    ...args,
    (err, value) => err ? reject(err) : resolve(value)
  )
)
const r$ = f => {
  const p = promisify(f)
  return (...args) => m.fromPromise(p(...args))
}

const elm = document.getElementById('root-node')
mount(elm, Folder(__dirname.slice(0, __dirname.lastIndexOf('/'))))

function Folder (path) {
  return h => {
    const stat = promisify(fs.stat.bind(fs))
    const readdir$ = r$(fs.readdir.bind(fs))
    const {join} = require('path')
    const entries$ = readdir$(path).map(names => Promise.all(
      names.map(
        name => stat(join(path, name)).then(stat => ({
          name,
          isDir: stat.isDirectory(),
          path: join(path, name)
        }))
      )
    )).await().map(entries => entries.filter(e => e.name !== '.git')).multicast()

    h('ul', {}, entries$.map(entries => h => {
      for (let i = 0; i < entries.length; i++) {
        let action = 'open ' + entries[i].path
        const openClose$ = h.$
          .filter(x => x.action === action && x.event.target instanceof window.HTMLButtonElement)
          .map(x => {
            x.event.stopPropagation()
            return x.event.target.className === 'open'
          })
          .startWith(false)
        h('li', {on: { click: action }}, (
          entries[i].isDir
          ? h => h(
            'div',
            {},
            openClose$
              .map(op => (
                op
                ? h => {
                  h('div', {}, h => {
                    h('button.close', {}, h => h('-'))
                    h(entries[i].name)
                  })
                  h('div', {}, Folder(entries[i].path))
                }
                : h => h('button.open', {}, h => h(entries[i].name))
              ))
          )
          : h => h(entries[i].name)
        ))
      }
    }).startWith(h => h('loading...')))
  }
}
