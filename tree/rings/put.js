const id = a => a
const eq = require('../eq')
const keepEqs = ft => r => a => {
  const b = r(a)
  if (b === a) return a
  if (typeof b === 'object' && b !== null && typeof a === 'object' && a !== null) {
    const bkeys = Object.keys(b)
    const akeys = Object.keys(a)
    const nb = bkeys.reduce((s, key) => {
      s[key] = eq(a[key], b[key]) ? a[key] : b[key]
      return s
    }, ft())
    return (
      akeys.length === bkeys.length && !akeys.some(key => a[key] !== nb[key])
      ? a
      : nb
    )
  }
  return b
}

const putRing = pith => (put, select) => {
  pith(Object.assign({}, put, {
    obj: (pmap = id) => put.obj(p => putRing(pmap(p))),
    arr: (pmap = id) => put.arr(p => putRing(pmap(p))),
    put: (key, state, ft = () => ({})) => put.val(key, select.$(state).map(a => () => a).map(keepEqs(ft)))
  }), select)
}

module.exports = putRing
