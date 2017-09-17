const H$ = require('./h$')
const pathRing = require('./path-ring')
const apiRing = require('./api-ring')
const stateRing = require('./state-ring')

const actionModule = require('../lib/drivers/snabbdom/actionModule')
const toVnode = require('snabbdom/tovnode').default
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  actionModule
])

module.exports = function mount (elm, pith, path = require('./list').nil) {
  const {sel, data} = toVnode(elm)
  data.path = path
  return H$(
    sel,
    data,
    pathRing(path, stateRing(0, apiRing(actionModule.action$)(pith)))
  )
    // .tap(require('debug')('patch'))
    .reduce(patch, {sel, data, elm, children: []})
}
