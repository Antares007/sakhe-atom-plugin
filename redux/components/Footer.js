const h = require('react-hyperscript')
const FilterLink = require('../containers/FilterLink')

const Footer = () => h('p', [
  'Show:',
  ' ',
  h(FilterLink, { filter: 'SHOW_ALL' }, 'All'),
  ', ',
  h(FilterLink, { filter: 'SHOW_ACTIVE' }, 'Active'),
  ', ',
  h(FilterLink, { filter: 'SHOW_COMPLETED' }, 'Completed')
])

module.exports = Footer
