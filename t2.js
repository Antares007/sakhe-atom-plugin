const debug = require('debug')('main') // eslint-disable-line
const Main = require('./lib/main')
const most = require('most')
const h = require('snabbdom/h').default
const isolate = require('./lib/isolate')

module.exports = function mainFunctionMonadLaws (sources) {
  const M = (main) => Main.of(main)
  const bind = (M, f) => Main.chain(f, M)
  const unit = Main.of

  const f = (main) => unit((sources) => ({
    DOM: most.combine(
      (...vdoms) => h('div', ['f(', ...vdoms, ')']),
      main(sources).DOM,
      main(sources).DOM
    )
  }))
  const g = (main) => unit((sources) => ({
    DOM: most.combine(
      (...vdoms) => h('div', ['g(', ...vdoms, ')']),
      main(sources).DOM,
      main(sources).DOM,
      main(sources).DOM
    )
  }))
  const _42 = (sources) => ({ DOM: most.of(h('b', '42')) })
  const laws = [
    [ bind(M(_42), f), f(_42) ],
    [ bind(M(_42), unit), M(_42) ],
    [ bind(bind(M(_42), f), g), bind(M(_42), (x) => bind(f(x), g)) ]
  ]
  return vertical(
    laws.map((progs) => horizontal(progs.map(p => shadow(p))))
  )(sources)
}

function b (sources) { // eslint-disable-line
  const sinks1 = isolate(c)(sources)
  const sinks2 = isolate(c)(sources)
  return {
    DOM: most.combine(function (vdom1, vdom2, v1, v2) {
      return h('div', [vdom1, vdom2, h('p', v1 + v2)])
    }, sinks1.DOM, sinks2.DOM, sinks1.value$, sinks2.value$)
  }
}

function c ({DOM}) {
  const value$ = DOM
    .map(({action}) => parseInt(action, 10))
    .filter(Boolean)
    .scan((a, x) => a + x, 0)
    .multicast()
  return {
    DOM: value$
      .map(i =>
        h('div.c', [
          h('button', {on: {click: '-1'}}, '-1'),
          h('button', {on: {click: '1'}}, '+1'),
          h('p', i)
        ])
      ),
    value$
  }
}

function vertical (progs) { // eslint-disable-line
  return Main.chainArray(function (mains) {
    return function (sources) {
      return {
        DOM: most.combineArray(
          (...vdoms) => h('div.vertical', vdoms.map((vdom) => h('div.item', [vdom]))),
          mains.map((m) => m(sources).DOM)
        )
      }
    }
  }, progs)
}

function horizontal (progs) { // eslint-disable-line
  return Main.chainArray(function (mains) {
    return function (sources) {
      const style = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'space-around'
      }
      return {
        DOM: most.combineArray((...vdoms) =>
          h(
            'div',
            { style },
            vdoms.map((vdom) => h('div', [vdom]))
          ),
          mains.map((m) => m(sources).DOM)
        )
      }
    }
  }, progs)
}

function shadow (prog) { // eslint-disable-line
  return Main.chain(function (main) {
    return function (sources) {
      return {
        DOM: main(sources).DOM.map((vdom) =>
          h('div.shadow', {
            style: {
              margin: '4px',
              padding: '5px',
              borderRadius: '10px',
              boxShadow: '1px 2px 6px rgba(0, 0, 0, .7)'
            }
          }, vdom))
      }
    }
  }, prog)
}
