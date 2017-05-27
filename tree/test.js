// const debug = require('debug')
const snabbdomBark = require('./snabbdom-bark')
const m = require('most')
const hf$Bark = require('./hf$-bark')

snabbdomBark(
  document.getElementById('root-node'),
  function ({path, $}) {
    var i = 0
    this.put(
      hf$Bark(path.split('/'), $, m.of(h => h('div.n', {style: {paddingLeft: i++ + 'px'}})), function ({path, $, action$}) {
        this.put(
          action$('a')
            .scan(c => c + 1, 0)
            .map(i => h => h('div.c', {}, [
              h('button', {on: {click: 'a'}}, 'click' + i)
            ]))
        )
        this.put(
          m.of(h => h('h1', 'hi' + i++))
        )
        this.put(
          hf$Bark(path.split('/'), $, m.of(h => h('div.nested', {})), Tree())
        )
        this.put(
          hf$Bark(path.split('/'), $, m.of(h => h('div.nested', {})), Form())
        )
        // this.node(m.of(h => h('div', {})), Tree(1, 4))
      })
    )
  }
).then((x) => console.log(x))

function Me (d = 2, w = 2) { //eslint-disable-line
  return function mePith ({path, rootNode, $}) {
    this.put(
      $.startWith('').map(x => h =>
        h('div', {}, [
          h('button', {on: {click: path}}, path),
          h('code', {}, x.action)
        ])
      ).until(
        $.filter(x => x.vnode.path === path)
      )
    )
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        const elm = document.createElement('div')
        elm.setAttribute('id', 'node-' + path)
        elm.style.paddingLeft = '20px'
        this.node(elm, Me(d - 1, w))
      }
    }
  }
}

function Counter (d = 2) { //eslint-disable-line
  return function pith ({path, action$}) {
    this.node(m.of(h => h('div', {style: {textAlign: 'center'}})), function () {
      const sum$ = action$(+1)
        .merge(action$(-1))
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
