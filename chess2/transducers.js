const reduce = require('./reduce')
const concat = (a, b) => a.concat(b)
const mapper = (fn, concat) => (acc, x) => concat(acc, fn(x))
const filterer = (fn, concat) => (acc, x) => fn(x) ? concat(acc, x) : acc

const xs = [1, 2, 3]
const rez = reduce(filterer(x => x > 1, mapper(x => x * 2, concat)), [], xs)
console.log(rez)
