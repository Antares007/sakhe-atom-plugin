const m = require('most')
const {Cons, nil} = require('../list')
const mostBark = require('./most')
const id = a => a
const cmp = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

class VTree {}

class VText extends VTree {
  constructor (text) {
    super()
    if (typeof text !== 'string') throw new Error('invalid text')
    this.text = text
  }
  log () {
    console.log(this.text)
  }
}

class VNode extends VTree {
  constructor (sel, data, children) {
    super()
    if (typeof sel !== 'string') throw new Error('invalid selector')
    if (typeof data !== 'object' || data === null) throw new Error('invalid data')
    if (!Array.isArray(children)) throw new Error('invalid children')
    if (children.some(a => !(a instanceof VTree))) throw new Error('invalid child')
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

const Node = (pmap = id) => (sel, data = {}) => mostBark(
  pith => ({put}, select) => {
    put(select.$(sel))
    put(select.$(data))
    const node = pmap => (sel, data) => pith => put(Node(pmap)(sel, data)(pith))
    const text = text => put(select.$(text).map(text => new VText(text)))
    const vnode = vnode => put(select.$(vnode).map(vnode => {
      if (vnode instanceof VTree) return vnode
      throw new Error('invalid vnode')
    }))
    pmap(pith)({node, text, vnode}, select)
  }
)(
  a$s => m.combineArray((s, d, ...chlds) => new VNode(s, d, chlds), a$s)
)

const pathRing = path => pith => function pathPith (put, select) {
  var i = 0
  pith(Object.assign({}, put, {
    node: (pmap = id) => (sel, data = {}) => pith => {
      const key = i++
      const thisPath = Cons(key, path)
      put.node(cmp(pathRing(thisPath), pmap))(
        sel, select.$(data).map(data => Object.assign({path, key}, data))
      )(pith)
    }
  }), Object.assign({}, select, {path}))
}

const vnodeBark = (pmap = require('../rings/api')) => (sel, data = {}, path = nil) =>
  Node(cmp(pathRing(path), pmap))(sel, data)

module.exports = vnodeBark

if (require.main === module) {
  vnodeBark()('div.a')((put, select) => {
    put.node('button', {on: {click: true}}, put => {
      put.node('button', put => {
        put.text('hello1')
      })
      put.text('hello2')
    })
    put.vnode(vnodeBark()('div.a', {path: select.path}, Cons('mount1', select.path))(put => {
      put.node('li', id)
      put.node('button', {on: {click: true}}, put => {
        put.node('button', put => {
          put.text('hello1')
        })
        put.text('hello2')
      })
      put.node('li', id)
    }))
  }).tap(v => v.log()).drain()
}
