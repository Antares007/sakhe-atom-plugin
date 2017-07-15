const nil = Object.create({
  toString () {
    return 'Nil'
  },
  endsWith (path) {
    return path === nil
  }
})

module.exports = { Cons, nil }

function Cons (head, tail) {
  if (!(
    tail instanceof Cons || tail === nil
  )) throw new Error('argument error tail')
  if (!(this instanceof Cons)) return new Cons(head, tail)
  this.head = head
  this.tail = tail
}

Cons.prototype.toString = function toString () {
  return `${this.head}/${this.tail.toString()}`
}

Cons.prototype.endsWith = function endsWith (path) {
  return this === path ? true : this.tail.endsWith(path)
}
