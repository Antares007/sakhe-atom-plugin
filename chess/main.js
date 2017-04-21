const React = require('react')
const ReactDOM = require('react-dom')
const h = React.createElement.bind(React)

const Board = require('./Board')

ReactDOM.render(
  h(Board, {knightPosition: [4, 4]}),
  document.getElementById('root-node')
)
