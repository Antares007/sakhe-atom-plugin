const eq = require('../eq')
const keepEqs = ft => r => o => {
  const a = r(o)
  if (typeof a === 'object' && a !== null && typeof o === 'object' && o !== null) {
    return Object.keys(a).reduce((s, key) => {
      s[key] = eq(o[key], a[key]) ? o[key] : a[key]
      return s
    }, ft())
  }
  return a
}

const sRing = pith => (obj, arr, val, select) => {
  const s = (...args) => val(...args)
  s.select = select
  s.obj = obj(sRing)
  s.arr = arr(sRing)
  s.ring = sRing
  s.keepEqs = keepEqs
  pith(s)
}

module.exports = sRing
