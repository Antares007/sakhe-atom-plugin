module.exports = function reduce (fn, acc, xs) {
  if (xs.length === 0) return acc
  const first = xs[0]
  const rest = xs.slice(1)
  return reduce(fn, fn(acc, first), rest)
}
