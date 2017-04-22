const { Component } = require('react')
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const { DragSource } = require('react-dnd')

const { ItemTypes } = require('./Constants')
const imgStr = require('./img')

const knightSource = {
  beginDrag (props) {
    return {}
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

class Knight extends Component {
  componentDidMount () {
    const img = new window.Image()
    img.src = imgStr
    img.onload = () => this.props.connectDragPreview(img)
  }
  render () {
    const { connectDragSource, isDragging } = this.props
    return connectDragSource(
      h('div', {
        style: {
          opacity: isDragging ? 0.1 : 1,
          fontSize: 50,
          fontWeight: 'bold',
          cursor: 'move',
          textAlign: 'center'
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
