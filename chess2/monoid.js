class _Sum {
  constructor (val) {
    this.val = val
  }
  concat (y) {
    return new _Sum(this.val + y.val)
  }
  empty () {
    return new _Sum(0)
  }
}
const Sum = (x) => new _Sum(x)

class _Max {
  constructor (val) {
    this.val = val
  }
  concat (y) {
    return new _Max(this.val > y.val ? this.val : y.val)
  }
  empty () {
    return new _Max(-Infinity)
  }
}
const Max = (x) => new _Max(x)

const reduce = require('./reduce')
const fold = function (monoids) {
  return reduce((a, m) => a.concat(m), monoids[0].empty(), monoids)
}

console.log(fold([Sum(1), Sum(2), Sum(3)]))
console.log(fold([Max(1), Max(2), Max(-3)]))

const foldMap = (f, xs) => fold(xs.map(f))
const sum = xs => foldMap(Sum, xs)
const max = xs => foldMap(Max, xs)

console.log(sum([1, 2, 3]))
console.log(max([1, 2, -3]))
