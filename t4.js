const most = require('most')
const {div} = require('./lib/hyperscript-helpers')

module.exports = function ({DOM}) {
  return {
    DOM: most.of(
      div('#app', {
        hook: {
          insert: (...args) => console.log(args)
        }
      })
    )
  }
}
