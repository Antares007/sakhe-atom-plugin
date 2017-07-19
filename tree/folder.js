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
const readdir$ = r$(fs.readdir.bind(fs))

const elm = document.getElementById('root-node')
mount(elm, Folder())

function Folder (path) {
  return h => {
    h('ul', {}, readdir$('/').map(list => h => {
      for (let i = 0; i < list.length; i++) {
        h('li', {}, h => {
          h(list[i])
        })
      }
    }))
  }
}
