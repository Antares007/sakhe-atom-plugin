const h = require('react-hyperscript')
const { render } = require('react-dom')
const { createStore } = require('redux')
const { Provider } = require('react-redux')

const todoApp = require('./reducers')
const App = require('./components/App')

let store = createStore(todoApp)

render(
  h(Provider, { store: store }, h(App)),
  document.getElementById('root-node')
)
