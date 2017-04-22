let nextTodoId = 0

module.exports = {
  addTodo (text) {
    return { type: 'ADD_TODO', id: nextTodoId++, text }
  },
  setVisibilityFilter (filter) {
    return { type: 'SET_VISIBILITY_FILTER', filter }
  },
  toggleTodo (id) {
    return { type: 'TOGGLE_TODO', id }
  }
}
