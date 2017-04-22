const h = require('react-hyperscript')

const Footer = require('./Footer')
const AddTodo = require('../containers/AddTodo')
const VisibleTodoList = require('../containers/VisibleTodoList')

const App = () => h('div', { style: { padding: '10px' } }, [
  h(AddTodo),
  h(VisibleTodoList),
  h(Footer)
])

module.exports = App
