const nil = Object.create({
  toString () {
    return 'Nil'
  }
})

module.exports = { Cons, nil }

function Cons (head, tail) {
  if (!(
    tail instanceof Cons || tail === nil
  )) throw new Error('argument error tail')
  if (!(this instanceof Cons)) return new Cons(Cons)
  this.head = head
  this.tail = tail
}

Cons.prototype.toString = function toString () {
  return `Cons(${this.head}, ${this.tail.toString()})`
}
