const { combineReducers } = require('redux')

const todos = require('./todos')
const visibilityFilter = require('./visibilityFilter')

const todoApp = combineReducers({ todos, visibilityFilter })

module.exports = todoApp
