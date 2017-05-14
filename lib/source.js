class Source {
  constructor ($) { this.$ = $ }
  map (f) { return new this.constructor(f(this.$)) }
}

class Sink {
  constructor (g) {
    this.g = g
  }
  map (f) { return new this.constructor($ => f(this.g)($)) }
  chain (f) { return f(this.g) }
  contramap (f) { return new this.constructor($ => this.g(f($))) }
  sink ($) { this.g($) }
}

module.exports = Object.assign(Source, { Source, Sink })
