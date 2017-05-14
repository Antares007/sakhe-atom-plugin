const Nil = {
  map: () => Nil,
  toString: () => 'Nil'
}

class _Cons {
  constructor (h, tl) {
    this.head = h
    this.tail = tl
  }
  map (f) {
    return Cons(this.head, f(this.tail))
  }
  toString () {
    const go = (l, pre = '', suf = '') => l === Nil
      ? pre + 'Nil' + suf
      : go(l.tail, pre + `Cons(${l.head}, `, `)${suf}`)
    return go(this)
  }
}

const Cons = (head, tail) => new _Cons(head, tail)

const cata = (f, xs) => f(xs.map(ys => cata(f, ys)))

const sum = (x) => {
  return x === Nil ? 0 : x.head + x.tail
}

const lst = Cons(1, Cons(2, Cons(3, Nil)))

console.log(cata(sum, lst))

const map = (f, xs) => cata(x => x === Nil ? Nil : Cons(f(x.head), x.tail), xs)

console.log(map(x => x + 10, lst).toString())

const ana = (g, a) => g(a).map(x => ana(g, x))
const arrayToList = xs => xs.length === 0 ? Nil : Cons(xs[0], xs.slice(1))

console.log(ana(arrayToList, [3, 4, 5]).toString())
