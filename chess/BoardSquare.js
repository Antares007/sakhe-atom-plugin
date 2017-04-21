const React = require('react')
const { Component } = React
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const { canMoveKnight, moveKnight } = require('./game')
const { ItemTypes } = require('./Constants')
const { DropTarget } = require('react-dnd')
const Square = require('./Square')

const squareTarget = {
  canDrop (props) {
    return canMoveKnight(props.x, props.y)
  },
  drop (props) {
    moveKnight(props.x, props.y)
  }
}

function collect (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }
}

class BoardSquare extends Component {
  renderOverlay (color) {
    return h('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 1,
        opacity: 0.5,
        backgroundColor: color
      }
    })
  }
  render () {
    var props = this.props
    var x = props.x
    var y = props.y
    var connectDropTarget = props.connectDropTarget
    var isOver = props.isOver
    var canDrop = props.canDrop
    var black = (x + y) % 2 === 1

    return connectDropTarget(
      h('div', {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%'
        }
      }, [
        h(Square, { black: black }, this.props.children),
        isOver && !canDrop && this.renderOverlay('red'),
        !isOver && canDrop && this.renderOverlay('yellow'),
        isOver && canDrop && this.renderOverlay('green')
      ])
    )
  }
}

BoardSquare.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired
}

module.exports = DropTarget(ItemTypes.KNIGHT, squareTarget, collect)(BoardSquare)
