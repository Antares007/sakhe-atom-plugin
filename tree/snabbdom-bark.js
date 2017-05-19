const m = require('most')
const snabbdom = require('snabbdom')
const {h} = snabbdom
const vdomBark = require('./vdom-bark')

module.exports = function snabbdomBark (elm, pith) {
  const actionModule = require('../lib/drivers/snabbdom/actionModule')

  const vnode$ = vdomBark(
    m.of(children => h('div#root-node', children)),
    // addPathRay(
    //   addRay(prev => prev || actionModule.action$,
    //     mapRays(
    //       ([push, path, $]) => [
    //         push, '/' + path.join('/'),
    //         $.filter(x => x.action.startsWith('/' + path.join('/')))
    //       ],
          pith
    //     )
    //   )
    // )
  )

  const patch = snabbdom.init([
    ...['class', 'props', 'style']
      .map(name => require('snabbdom/modules/' + name).default),
    actionModule
  ])
  vnode$
    // .tap(debug('patch'))
    .reduce(patch, elm)
}

function mapRays (f, pith) {
  return function (...rays) {
    pith(...f(rays))
  }
}
function addRay (map, pith, initial = void 0) {
  return function (...args) {
    const input = map(initial)
    pith.apply({
      bark: pith => {
        this.bark(addRay(map, pith, input))
      }
    }, [...args, input])
  }
}
function addPathRay (pith, path = []) {
  return function (...args) {
    var i = 0
    pith.apply({
      bark: pith => {
        this.bark(addPathRay(pith, path.concat(i)))
        i++
      }
    }, args.concat([path]))
  }
}
