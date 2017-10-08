const debug = require('debug') // eslint-disable-line
const m = require('most') // eslint-disable-line
const watch$ = require('./watch$')
const eq = require('../eq')
const vnodeBark = require('../barks/vnode') // eslint-disable-line
const {Cons} = require('../list') // eslint-disable-line
const {join: pathJoin} = require('path') // eslint-disable-line
// const id = a => a
const PatchBark = require('../barks/patch')

const nRing = require('../rings/n-ring')
const apiRing = require('../rings/api')

const Folder = path => nRing(h => { // eslint-disable-line
  h.n('div', {}, {})((s, action$) => {
    s.put('lis', watch$(path).map(es =>
      Object.keys(es).reduce((s, key) => {
        const {size, mode, mtime} = es[key]
        s[key] = {size, mode, mtime, isDir: !!(mode & parseInt('040000', 8))}
        return s
      }, {})
    ))
    // s.select(['lis']).scan((oldLis, lis) => {
    //   const newLis = {}
    //   for (let name in lis) {
    //     newLis[name] =
    //   }
    //   return newLis
    // }, {})
    return s.select(['lis'])
      .filter(lis => Object.keys(lis).length > 0)
      .skipRepeatsWith((a, b) => eq(Object.keys(a).sort(), Object.keys(b).sort()))
      .map(lis => (h, select) => {
        h('ul', h => {
          for (let name in lis) {
            h('li', {key: name, path: h.path}, select(['lis', name]).map(li => h => {
              h(name)
              h(' - ')
              h(Math.random())
            }))
          }
          h(Math.random())
        })
      })
  })
})
PatchBark(p => nRing(apiRing(p)))(document.getElementById('root-node'))((put, select) => {
  put.text(select.action$.tap(debug('root')).map(x => x.action + '').startWith('n/a'))
  put.n('div.a', (enter, select) => {
    // enter.val('count', select.action$.map(x => s => s + x.action)
    //                                  .startWith(s => 0))
    enter.put('count', select.action$.scan((c, x) => c + x.action, 0))
    return (put, select) => {
      put.element('button', {on: {click: +1}}, put => put.text('+'))
      put.element('button', {on: {click: -1}}, put => put.text('-'))
      put.text(select.path(['count']).map(n => n + ''))
    }
  })
  // h('div', Folder(pathJoin(__dirname, '..')))
})
  .drain()
