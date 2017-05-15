const snabbdom = require('snabbdom')
const {curry2} = require('@most/prelude')
const h = snabbdom.h

const m = require('most')
const rootNode = require('./rootnode')
const setKetByIndex = (vnode, i) => Object.assign({}, vnode, {key: i})
const identity = curry2(m.combineArray)(
  (...as) => h('div', as.map(setKetByIndex))
)
const tree$ = rootNode(identity, g => {
  g(m.periodic(1000).scan(c => c + 1, 0).map(i => h('div', i)))
  g(rootNode(identity, g => {
    g(m.of(h('div', 'a')))
    g(rootNode(identity, g => {
      g(m.of(h('input', {props: {type: 'checkbox', checked: true}})))
      g(m.of(h('input', {props: {type: 'checkbox', checked: false}})))
    })())
    g(m.of(h('div', 'b')))
  })())
  g(m.periodic(1000).delay(500).scan(c => c - 1, 0).map(i => h('div', i)))
})()

const patch = snabbdom.init(['class', 'props', 'style'].map(
  name => require('snabbdom/modules/' + name).default
))
tree$.reduce(patch, document.getElementById('root-node'))
