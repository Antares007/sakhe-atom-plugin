const PropTypes = require('prop-types')
const h = require('react-hyperscript')

const Link = ({ active, children, onClick }) => {
  if (active) return h('span', children)
  return h('a', {
    href: '#',
    onClick: e => {
      e.preventDefault()
      onClick()
    }
  }, children)
}

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
}

module.exports = Link
