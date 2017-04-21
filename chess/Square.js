const React = require('react')
const { Component } = React
const PropTypes = require('prop-types')
const h = require('react-hyperscript')

class Square extends Component {
  render () {
    const { black } = this.props
    const fill = black ? 'black' : 'white'
    const stroke = black ? 'white' : 'black'
    return h('div.square', {
      style: {
        backgroundColor: fill,
        color: stroke,
        width: '100%',
        height: '100%'
      }
    }, this.props.children)
  }
}
Square.propTypes = {
  black: PropTypes.bool
}
module.exports = Square
