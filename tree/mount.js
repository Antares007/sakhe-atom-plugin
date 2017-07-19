const H$ = require('./h$')

const toVnode = require('snabbdom/tovnode').default
const patch = require('snabbdom').init([
  ...['class', 'props', 'style', 'attributes'].map(name => require('snabbdom/modules/' + name).default),
  require('../lib/drivers/snabbdom/actionModule')
])

module.exports = function mount (elm, pith, path = require('./list').nil) {
  const {sel, data} = toVnode(elm)
  data.path = path
  return H$(sel, data, pith)
      .reduce(patch, {sel, data, elm, children: []})
}
