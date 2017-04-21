const ReactDOM = require('react-dom')
const h = require('react-hyperscript')

const Board = require('./Board')

ReactDOM.render(
  h(Board, {knightPosition: [4, 4]}),
  document.getElementById('root-node')
)
