const m = require('most')
const $ = require('../$')
const {Cons, nil} = require('../list')
const mostBark = require('./most')
const id = a => a
const cmp = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

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
    console.groupCollapsed(grpKey, this.path)
    this.children.forEach(v => v.log())
    console.groupEnd(grpKey)
  }
}

const Element = (pmap = id) => (sel, data = {}) => mostBark(
  pith => ({put}) => {
    put(sel)
    put(data)
    const element = pmap => (sel, data) => pith => put(Element(pmap)(sel, data)(pith))
    const text = text => put($(text).map(text => new VText(text)))
    const vnode = vnode => put($(vnode).map(vnode => {
      if (vnode instanceof VNode) return vnode
      throw new Error('invalid vnode')
    }))
    pmap(pith)({element, text, vnode})
  }
)(
  a$s => m.combineArray((s, d, ...chlds) => new VElement(s, d, chlds), a$s)
)

const pathRing = path => pith => function pathPith (put) {
  var i = 0
  pith(Object.assign({}, put, {
    element: (pmap = id) => (sel, data = {}) => pith => {
      const key = i++
      const thisPath = Cons(key, path)
      put.element(cmp(pathRing(thisPath), pmap))(
        sel, $(data).map(data => Object.assign({path, key}, data))
      )(pith)
    },
    path
  }))
}

const vnodeBark = (pmap = require('../rings/api')) => (sel, data = {}, path = nil) =>
  Element(cmp(pathRing(path), pmap))(sel, data)

module.exports = vnodeBark

if (require.main === module) {
  vnodeBark()('div.a')((put) => {
    console.log(put.element.toString())
    put.element('button', {on: {click: true}}, put => {
      put.element('button', put => {
        put.text('hello1')
      })
      put.text('hello2')
    })
    console.log(put)
    put.vnode(vnodeBark()('div.a', {path: put.path}, Cons('mount1', put.path))(put => {
      put.element('li', id)
      put.element('button', {on: {click: true}}, put => {
        put.element('button', put => {
          put.text('hello1')
        })
        put.text('hello2')
      })
      put.element('li', id)
    }))
  }).tap(v => v.log()).drain()
}
