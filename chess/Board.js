const { Component } = require('react')
const PropTypes = require('prop-types')
const h = require('react-hyperscript')

const Knight = require('./Knight')
const Square = require('./Square')

class Board extends Component {
  renderSquare (i) {
    const x = i % 8
    const y = Math.floor(i / 8)
    const black = (x + y) % 2 === 1
    const [knightX, knightY] = this.props.knightPosition
    const piece = (x === knightX && y === knightY) ? h(Knight) : null

    return h('div', {key: i, style: { width: '12.5%', height: '12.5%' }},
      h(Square, {black}, piece)
    )
  }

  render () {
    const squares = []
    for (let i = 0; i < 64; i++) {
      squares.push(this.renderSquare(i))
    }
    return h('div.board', {style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexWrap: 'wrap'
    }}, squares)
  }
}
Board.propTypes = {
  knightPosition: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired
}
module.exports = Board
