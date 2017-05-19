const m = require('most')
const snabbdom = require('snabbdom')
const {h} = snabbdom
const vdomBark = require('./vdom-bark')

module.exports = function snabbdomBark (elm, pith) {
  const actionModule = require('../lib/drivers/snabbdom/actionModule')

  const vnode$ =
    vdomBark(m.of(children => h('div#root-node', children)),
      addPathRay(
        addRay(actionModule.action$,
          pith
        )
      )
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

function addRay (ray, pith) {
  return function (push, bark, ...rays) {
    pith(
      push,
      (viewFn$, pith) => bark(viewFn$, addRay(ray, pith)),
      ...rays,
      ray)
  }
}

function addPathRay (pith, path = []) {
  return function (push, bark, ...rest) {
    var i = 0
    pith(
      push,
      (viewFn$, pith) => bark(viewFn$, addPathRay(pith, path.concat(i++))),
      ...rest,
      path
    )
  }
}
