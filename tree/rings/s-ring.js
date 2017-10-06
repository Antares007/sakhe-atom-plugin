const eq = require('../eq')
const put = a => () => a
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

const $ = require('../$')

const sRing = pith => (obj, arr, val, select) => {
  const s = (...args) => val(...args)
  s.select = select
  s.obj = obj(sRing)
  s.arr = arr(sRing)
  s.ring = sRing
  s.put = (key, state, ft = () => ({})) => val(key, $(state).map(put).map(keepEqs(ft)))
  s.keepEqs = keepEqs
  pith(s)
}

module.exports = sRing
