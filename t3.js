const most = require('most')
const runReact = require('./lib/run-react')
const rootNode = document.getElementById('root-node')
const h = require('react-hyperscript')

const reactCycle = runReact(
  function A (props) {
    return h('h1', props.message)
  },
  rootNode
)

const sinks = reactCycle({
  props$: most.of({message: 'message1', knightPosition: [1, 7]})
    .merge(most.never())
    // .until(most.of().delay(3000))
})

const disposable = sinks.action$.source.run({}, most.defaultScheduler)
setTimeout(() => disposable.dispose(), 3000)
