const debug = require('debug')
const m = require('most')
const {h} = require('snabbdom')
const hf$Bark = require('./vdom-bark')


function Form () {
  return function ({action$}) {
    var state
    const state$ = action$('input').map(x => x.event.target.value)
        .scan((s, v) => v, 'A')
        .tap(s => { state = s })
        .multicast()
    this.put(
      state$.map(value =>
        h('input', {
          on: {input: 'input'},
          props: {type: 'text', value}
        })
      ),
      state$.map(value =>
        h('button', {
          on: {click: 'add'},
          props: {disabled: value.length === 0}
        }, 'add')
      )
    )
    this.return(action$('add').map(() => state))
  }
}

function Me () {
  return function ({action$}) {
    const [add$] = this.node(h('div'), Form())
    add$.observe(debug('add$'))
    // this.put(
    //   vdomBark(m.of(children => h('div', children)), function () {
    //     this.put(m.of('hello'))
    //   })
    // )
  }
}

function Counter (d = 0) { //eslint-disable-line
  return function pith ({path, action$}) {
    this.node(m.of(h => h('div', {style: {textAlign: 'center'}})), function () {
      const sum$ = action$(+1).merge(action$(-1))
        .scan((sum, x) => sum + x.action, 0)
      this.put(sum$.map(sum => h => h('div', {}, [sum])))
      this.node(m.of(h => h('button', {on: {click: +1}})), function () {
        this.put(m.of(h => '+'))
        if (d < 3) this.node(m.of(h => h('div', {})), Counter(d + 1))
      })
      this.node(m.of(h => h('button', {on: {click: -1}})), function () {
        this.put(m.of(h => '-'))
        if (d < 3) this.node(m.of(h => h('div', {})), Counter(d + 1))
      })
    })
  }
}

function Tree (d = 4, w = 2) {
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

require('./snabbdom-bark')(
  document.getElementById('root-node'),
  hf$Bark.assignRays(rays => ({
    action$: a => rays.$.filter(x => {
      if (typeof a === 'function') return a(x)
      return x.action === a
    })
  }))(
    Counter()
  )
)
