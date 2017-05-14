const Source = require('../lib/source')
const most = require('most')
const {curry2, curry3} = require('@most/prelude')
const {h} = require('snabbdom')
const h2 = curry2(h) // eslint-disable-line
const h3 = curry3(h) // eslint-disable-line

// const updateIn = curry3((path, r, s) => path.slice(0).reverse().reduce((r, scope) => s => {
//   if (!s) return {[scope]: r()}
//   if (s[scope]) {
//     const a = r(s[scope])
//     if (a === s[scope]) return s
//     return isArrayLike(s)
//       ? replace(a, Number(scope), s)
//       : Object.assign({}, s, { [scope]: r(s[scope]) })
//   }
//   if (isArrayLike(s)) {
//     const index = Number(scope)
//     if (index >= s.length) {
//       throw new Error('cant update index')
//     }
//   }
//   return Object.assign({}, s, { [scope]: r() })
// }, r)(s))
// const log = (a) => (console.log(a), a) // eslint-disable-line

const collect = curry3((Constructor, combine, g) => {
  const [cb, $] = Source.Connector(most.of, combine)
  g($)
  return new Constructor(cb)
})
const setKeysByIndex = (x, i) => {
  if (x && x.key) {
    x.key = i
  }
  return x
}
const wrap = curry2((render, [sink, source]) => ([
  sink.chain(g => collect(
    sink.constructor,
    ($s) => most.combineArray((...vs) => render(vs.map(setKeysByIndex)), $s),
    g
  )),
  source
]))
const div = curry2((sel, DOM) =>
  wrap(
    h3('div.' + sel, {style: {padding: '0px 10px'}}))(DOM)
  )
const node = curry2(
  (f, parentDOM) => {
    f(div('node', parentDOM))
  }
)

const snabbdomTree = require('../lib/drivers/snabbdom')
const rootDOM = snabbdomTree(document.getElementById('root-node'))

main(rootDOM)
function main (DOM) {
  const timesLeft$ = most.periodic(1000).scan(a => a - 1, 60).takeWhile(Boolean)

  node(DOM => {
    DOM[0].sink(
      timesLeft$.map(i => h('div', [
        h('h1', 'times left ' + i + 's')
      ]))
    )
    for (let i = 0; i < 4; i++) {
      DOM[0].sink(
        timesLeft$.map(timesLeft => renderCounter(i)(timesLeft, '', ''))
      )
    }
  }, DOM)
}

function Counter (DOM, i = 0) { // eslint-disable-line
  const dot = (name) => (obj) => obj[name]
  DOM.sink.sink(
    DOM.source.$
      .map(dot('action'))
      .scan((s, a) => s + a, 0)
      .map(sum => renderCounter(1)(sum, '', ''))
  )
}

function renderButton (action, content, color) {
  return (
    h('button', {
      on: {click: action},
      style: {
        backgroundColor: action > 0
          ? `rgb(${color}, ${color}, 255)`
          : `rgb(255, ${color}, ${color})`
      }
    }, [ h('h2', action > 0 ? '+' : '-'), content ])
  )
}

function renderCounter (i) {
  return (sum, lvdom, rvdom) => {
    const color = 100 + i * 40
    return (
      h('div', {style: {padding: '5px 10px', textAlign: 'center'}}, [
        renderButton(+1, lvdom, color),
        renderButton(-1, rvdom, color),
        h('h2', sum)
      ])
    )
  }
}

// function Node (DOM, i = 0) {
//   DOM[0].sink(
//     most.of()
//       .map(constant(h2('div.n', 'node ' + i)))
//       .merge(most.never())
//   )
//
//   if (i < 3) {
//     const chieldDOM =
//       wrap(
//         h2('div.zmuki' + i),
//         DOM
//       )
//
//     Leaf(chieldDOM)
//     Node(chieldDOM, i + 1)
//     Leaf(chieldDOM)
//   }
// }
//
// function Leaf (parentDOM) {
//   parentDOM[0].sink(
//     most.of()
//       .map(constant(h('div.l', 'leaf')))
//       .merge(most.of().delay(Math.random() * 2000 + 100000))
//   )
//   return parentDOM
// }

// function speed (DOM) {
//   const l$ = most.periodic(5)
//     .scan(a => a + 1, 0)
//     .map(i => h('div.l', 'leaf ' + i))
//   const r = div('r', DOM)
//   for (var i = 0; i < 13; i++) {
//     const r2 = (
//       div('c',
//         sink([l$, l$, l$],
//           div('b',
//             sink([l$],
//               div('a', r)
//             )
//           )
//         )
//       )
//     )
//     sink([l$],
//       div('d', r2)
//     )
//   }
// }
