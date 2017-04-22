const ReactDOM = require('react-dom')
const h = require('react-hyperscript')

const Board = require('./Board')
const {observe} = require('./game')

observe(knightPosition =>
  ReactDOM.render(
    h(Board, {knightPosition}),
    document.getElementById('root-node')
  )
)
