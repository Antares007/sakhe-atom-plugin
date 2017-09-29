const m = require('most')
const $ = require('../$')
const {Cons, nil} = require('../list')
const Bark = require('./bark')
const id = a => a

const TextElement = (text) => $(text).map(text => {
  if (typeof text !== 'string') throw new Error('invalid text')
  return { text }
})

const Element = (sel, data, pith, pmap = id, cmap = id) => Bark(
  cmap(a$s => m.combineArray((...as) => as, a$s)),
  pith,
  pith => c => {
    c($(sel).map(sel => {
      if (typeof sel !== 'string') throw new Error('invalid selector')
      return sel
    }))
    c($(data).map(data => {
      if (typeof data !== 'object' || data === null) throw new Error('invalid data')
      return data
    }))
    pmap(pith)(
      (sel, data, pith, pmap = id) => c(Element(sel, data, pith, pmap, cmap)),
      text => c(TextElement(text))
    )
  }
)

module.exports = (sel, data, pith, fmap = id, cmap = id, path = nil) =>
  Element(sel, data && pith ? data : {}, pith || data, p => pathRing(path, apiRing(fmap(p))), cmap)

function pathRing (path, pith) {
  return function pathPith (elm, txt) {
    var i = 0
    pith(
      (sel, data, pith, pmap = id) => {
        const key = i++
        const thisPath = Cons(key, path)
        elm(
          sel,
          $(data).map(data => Object.assign({path: thisPath, key}, data)),
          pith,
          pith => pathRing(thisPath, pmap(pith))
        )
      },
      txt,
      path
    )
  }
}

function apiRing (pith) {
  return (elm, txt, path) => {
    const h = (sel, data, pith, pmap = id) => (
        !data && !pith
        ? txt($(sel).map(text => typeof text === 'string' ? text : JSON.stringify(text)))
        : elm(sel, data && pith ? data : {}, pith || data, pith => apiRing(pmap(pith)))
      )
    h.path = path
    pith(h)
  }
}
