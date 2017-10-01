const m = require('most')
const $ = require('../$')
const {Cons, nil} = require('../list')
const Bark = require('./bark')
const id = a => a
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

class VNode {}

class VText extends VNode {
  constructor (text) {
    super()
    if (typeof text !== 'string') throw new Error('invalid text')
    this.text = text
  }
  log () {
    console.log(this.text)
  }
}

class VElement extends VNode {
  constructor (sel, data, children) {
    super()
    if (typeof sel !== 'string') throw new Error('invalid selector')
    if (typeof data !== 'object' || data === null) throw new Error('invalid data')
    if (!Array.isArray(children)) throw new Error('invalid children')
    if (children.some(a => !(a instanceof VNode))) throw new Error('invalid child')
    this.sel = sel
    this.data = data
    this.children = children
    if (typeof data.key !== 'undefined') {
      this.key = data.key
    }
    if (data.path) {
      this.path = data.path.toString()
    }
  }
  log () {
    const grpKey = this.sel + (
      typeof this.key !== 'undefined'
      ? '/' + this.key
      : ''
    )
    console.group(grpKey, this.path)
    this.children.forEach(v => v.log())
    console.groupEnd(grpKey)
  }
}

const Element = (pmap = id) => (sel, data = {}) => Bark(
  a$s => m.combineArray(
    (sel, data, ...chlds) => new VElement(sel, data, chlds),
    a$s
  ),
  pith => c => {
    c(sel)
    c(data)
    pmap(pith)(
      pmap => (sel, data) => pith => c(Element(pmap)(sel, data)(pith)),
      text => c($(text).map(text => new VText(text))),
      vnode => c($(vnode).map(vnode => {
        if (vnode instanceof VNode) return vnode
        throw new Error('invalid vnode')
      }))
    )
  }
)

const pathRing = path$ => pith => function pathPith (elm, text, vnode) {
  var i = 0
  const element = (pmap = id) => (sel, data = {}) => pith => {
    const key = i++
    const thisPath$ = path$.map(path => Cons(key, path)).multicast()
    elm(compose(pathRing(thisPath$), pmap))(
      sel, $(data).flatMap(data => thisPath$.map(path => Object.assign({path, key}, data)))
    )(pith)
  }
  pith(element, text, vnode, path$)
}

const H$ = (pmap = id) => (sel, data = {path: nil}) =>
  Element(compose(pathRing($(data).map(d => d.path)), pmap))(sel, data)

module.exports = H$

if (require.main === module) {
  H$()('div.a')(
    (elm, txt, vnode, path$) => {
      elm()('button', {on: {click: true}})(
        (elm, txt) => {
          txt('hi2')
        }
      )
      txt('hi')
      vnode(
        H$()('div.a', path$.map(path => ({path: Cons('mount1', path)})))(
          (elm, txt, vnode) => {
            elm()('li')(id)
            txt('hello')
            elm()('li')(id)
            elm()('li')(id)
            elm()('li')(id)
          }
        )
      )
    }).tap(v => v.log()).drain()
}
