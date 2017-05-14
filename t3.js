const most = require('most')
const run = require('./lib/run')
const rootNode = document.getElementById('root-node')
const h = require('snabbdom').h
const makeSnabbdomDriver = require('./lib/drivers/snabbdom')

const cycle = run(Counter, {
  DOM: makeSnabbdomDriver(rootNode)
})
const sinks = cycle()
const disposable = sinks.sinks$.source.run({
  event: (t, e) => console.log('event', e),
  error: (t, err) => console.log('error', err),
  end: (t) => console.log('end')
}, most.defaultScheduler)

setTimeout(() => disposable.dispose(), 3000)

function Counter ({DOM}) { // eslint-disable-line
  return {
    DOM: DOM.map(({action}) => action)
      .filter(Number)
      .scan((s, a) => s + a, 0)
      .map(i =>
        h('div', {style: {padding: '10px'}}, [
          h('button', {on: {click: -1}}, 'Decrement'),
          h('button', {on: {click: +1}}, 'Increment'),
          h('h1', i)
        ])
      )
  }
}
