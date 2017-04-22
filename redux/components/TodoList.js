const PropTypes = require('prop-types')
const h = require('react-hyperscript')

const Todo = require('./Todo')

const TodoList = ({ todos, onTodoClick }) => h('ul',
  todos.map(todo => h(
    Todo,
    Object.assign(
      { key: todo.id },
      todo,
      { onClick: () => onTodoClick(todo.id) }
    )
  ))
)

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  onTodoClick: PropTypes.func.isRequired
}

module.exports = TodoList
