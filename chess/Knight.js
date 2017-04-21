const { Component } = require('react')
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const { DragSource } = require('react-dnd')

const { ItemTypes } = require('./Constants')

const knightSource = {
  beginDrag (props) {
    return {}
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class Knight extends Component {
  render () {
    const { connectDragSource, isDragging } = this.props
    return connectDragSource(
      h('div', {
        style: {
          opacity: isDragging ? 0.1 : 1,
          fontSize: 25,
          fontWeight: 'bold',
          cursor: 'move'
        }
      }, '♘')
    )
  }
}

Knight.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
}

module.exports = DragSource(ItemTypes.KNIGHT, knightSource, collect)(Knight)
