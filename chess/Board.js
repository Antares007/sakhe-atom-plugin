const { Component } = require('react')
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const { DragDropContext } = require('react-dnd')
const HTML5Backend = require('react-dnd-html5-backend')

const Knight = require('./Knight')
const BoardSquare = require('./BoardSquare')
const {moveKnight, canMoveKnight} = require('./game')

class Board extends Component {
  handleSquareClick (toX, toY) {
    if (canMoveKnight(toX, toY)) {
      moveKnight(toX, toY)
    }
  }
  renderSquare (i) {
    const x = i % 8
    const y = Math.floor(i / 8)
    return (
      h('div', {
        key: i,
        style: { width: '12.5%', height: '12.5%' }
      }, h(BoardSquare, {x, y}, this.renderPiece(x, y)))
    )
  }
  renderPiece (x, y) {
    const [knightX, knightY] = this.props.knightPosition
    if (x === knightX && y === knightY) {
      return h(Knight)
    }
  }
  render () {
    const squares = []
    for (let i = 0; i < 64; i++) {
      squares.push(this.renderSquare(i))
    }
    return h('div.board', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap'
      }
    }, squares)
  }
}
Board.propTypes = {
  knightPosition: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired
}
module.exports = DragDropContext(HTML5Backend)(Board)
