const debug = require('debug') //eslint-disable-line
const m = require('most')
// const {h} = require('snabbdom')
// const hf$Bark = require('./vdom-bark')
// const ring = require('./ring')

function Form () { //eslint-disable-line
  return function ({action$}) {
    // var state
    const state$ = action$('input').map(x => x.event.target.value)
        .scan((s, v) => v, '')
        // .tap(s => { state = s })
        .multicast()
    this.put(state$.map(value => h =>
      h('div', {}, [
        h('input', {
          on: {input: 'input'},
          props: {type: 'text', value}
        }),
        h('button', {
          on: {click: 'add'},
          props: {disabled: value.length === 0}
        }, 'add')
      ])
    ))
    // this.return(action$('add').map(() => state))
  }
}

function Folder () { //eslint-disable-line
  return function ({action$, path, $}) {
    this.put(m.of(h => h('h1', {}, path)))
    // this.snode()
  }
}

const run = function Counter (d = 4) { //eslint-disable-line
  return function pith ({path, action$}) {
    this.node(m.of(h => h('div', {style: {textAlign: 'center'}})), function () {
      const sum$ = action$(+1).merge(action$(-1))
        .scan((sum, x) => sum + x.action, 0)
      this.put(sum$.map(sum => h => h('div', {}, [sum, h('p', {}, path)])))
      this.node(m.of(h => h('button', {on: {click: +1}})), function ({path}) {
        this.put(m.of(h => '+'))
        if (d > 0) this.node(m.of(h => h('div', {})), Counter(d - 1))
      })
      this.node(m.of(h => h('button', {on: {click: -1}})), function ({path}) {
        this.put(m.of(h => '-'))
        if (d > 0) this.node(m.of(h => h('div', {})), Counter(d - 1))
      })
    })
  }
}



function Tree (d = 4, w = 2) { //eslint-disable-line
  return function ({path, action$}) {
    this.put(m.of(h =>
      h('button', {on: {click: path}}, path)
    ))
    this.put(
      action$(() => true).map(x => x.action).startWith('A')
        .map(x => h => h('span', {}, x))
    )
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        this.node(
          m.of(h => h('div', {style: {paddingLeft: '10px'}})),
          Tree(d - 1, w)
        )
      }
    }
  }
}

require('./snabbdom-bark')(document.getElementById('root-node'), run())
