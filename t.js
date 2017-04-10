module.exports = function ({DOM}) {
  const {most, h} = this
  return {
    DOM: DOM
      .map(({action}) => parseInt(action, 10))
      .scan((a, x) => a + x, 0)
      .map(i =>
        h('div', [
          h('button', {on: {click: '-1'}}, 'Decrement'),
          h('button', {on: {click: '1'}}, 'Increment'),
          h('p', i)
        ])
      )
  }
}
