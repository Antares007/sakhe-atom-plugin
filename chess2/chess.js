const most = require('most')
const {h} = require('snabbdom')
const R = require('ramda')
const isolate = require('../lib/isolate')
const Main = require('../lib/main')
const mergeSinks = (concats, xs) => {
  const rez = xs.reduce((s, sinks) => Object.keys(sinks).reduce((s, key) => {
    s[key] = s[key] || []
    s[key].push(sinks[key])
    return s
  }, s), {})
  return Object.keys(rez).reduce((s, key) => {
    s[key] = (concats[key] || most.mergeArray)(rez[key])
    return s
  }, {})
}
const renderSquare = ({black, content, canDrop, dropResult}) => h('div', {
  style: {
    width: '12.5%',
    height: '12.5%',
    backgroundColor: black ? 'black' : 'white',
    color: black ? 'white' : 'black'
  },
  on: {click: 'click'},
  dnd: {
    target: ['knight'],
    onDrop: 'drop'
  }
}, content)

const Square = ({DOM, props$}) => {
  return {
    DOM: props$.map(renderSquare),
    onClick$: most.merge(
      DOM.filter(({action}) => action === 'click'),
      DOM.filter(({action}) => action === 'drop')
    ),
    State: props$.map(p => () => ({state: p}))
  }
}

const renderKnight = (isDragging = false) => h('div', {
  key: 'knight',
  style: {
    opacity: isDragging ? 0.1 : 1,
    fontSize: '50px',
    fontWeight: 'bold',
    cursor: 'move',
    textAlign: 'center'
  },
  dnd: {
    source: 'knight'
  }
}, '♘')

const Board = Main.chainArray((squares) => ({props$}) => {
  const sinkss = squares.map((square, i) => {
    const x = i % 8
    const y = Math.floor(i / 8)
    const black = (x + y) % 2 === 1
    const sinks = square({
      props$: props$.map(({position: [kx, ky], canMoveTo}) => ({
        canDrop: canMoveTo([x, y]),
        dropResult: {x, y},
        black,
        content: x === kx && y === ky
          ? renderKnight()
          : canMoveTo([x, y])
            ? h('div', {
              key: 'canmove',
              style: {
                width: '100%',
                height: '100%',
                borderColor: black ? 'yellow' : 'green',
                borderStyle: 'dashed',
                borderWidth: '5px'
              }
            })
            : void 0
      })).skipRepeatsWith(R.equals).multicast()
    })
    return {
      DOM: sinks.DOM,
      moveTo$: sinks.onClick$.map(() => [x, y])
    }
  })
  return mergeSinks({
    DOM: R.curry(most.combineArray)((...vdoms) => h('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap'
      }
    }, vdoms))
  }, sinkss)
}, R.range(0, 64).map((i) => isolate(Square, 'square-' + i)))

const Game = Main.chain((board) => function ({State}) {
  const canMove = ([ox, oy], [nx, ny]) => {
    const dx = Math.abs(nx - ox)
    const dy = Math.abs(ny - oy)
    return dx === 1 && dy === 2 || dx === 2 && dy === 1
  }
  const sinks = board({
    props$: State.map((position) => ({
      position,
      canMoveTo: canMove.bind({}, position)
    }))
  })
  return {
    State: sinks.moveTo$
      .map((to) => (from) => canMove(from, to) ? to : from)
      .startWith(() => [1, 7])
  }
}, isolate(Board, 'board'))

module.exports = isolate(Game, 'GG')
