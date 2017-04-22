const R = require('ramda')
const Type = require('union-type')
const most = require('most')
const {div, h1, button} = require('./lib/hyperscript-helpers')

module.exports = function ({DOM}) {
  const Actions = Type({
    IncrementBy: [Number],
    DecrementBy: [Number],
    MultiplyBy: [Number]
  })
  return {
    Subscribe: most.of(DOM.tap(console.log.bind(console))),
    DOM: DOM
      .map(R.prop('action'))
      .scan(R.flip(Actions.case({
        IncrementBy: (by, state) => state + by,
        DecrementBy: (by, state) => state - by,
        MultiplyBy: (by, state) => state * by,
        _: (state) => state
      })), 0)
      .map(i =>
        div([
          button({on: {click: Actions.DecrementBy(1)}}, 'Decrement'),
          button({on: {click: Actions.IncrementBy(1)}}, 'Increment'),
          button({on: {click: Actions.MultiplyBy(2)}}, 'MultiplyBy 2'),
          h1(i)
        ])
      )
  }
}
