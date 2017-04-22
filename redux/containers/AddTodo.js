const h = require('react-hyperscript')
const { connect } = require('react-redux')

const { addTodo } = require('../actions')

let AddTodo = ({ dispatch }) => {
  let input
  return h('div', [
    h('form', {
      onSubmit: e => {
        e.preventDefault()
        if (!input.value.trim()) return
        dispatch(addTodo(input.value))
        input.value = ''
      }
    }, [
      h('input', { ref: node => { input = node } }),
      h('button', { type: 'submit' }, 'Add Todo')
    ])
  ])
}

module.exports = connect()(AddTodo)
