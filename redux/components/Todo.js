const PropTypes = require('prop-types')
const h = require('react-hyperscript')

const Todo = ({ onClick, completed, text }) => h('li', {
  onClick,
  style: { textDecoration: completed ? 'line-through' : 'none' }
}, text)

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

module.exports = Todo
