const debug = require('debug')('main') // eslint-disable-line
const R = require('ramda')
const Main = require('./lib/main')
const most = require('most')
const {div, input, h1, b, button, span} = require('./lib/hyperscript-helpers')
const isolate = require('./lib/isolate')
// const Type = require('union-type')

module.exports = function ({DOM}) {
  const name$ = DOM
    .filter(R.whereEq({action: 'input'}))
    .map(R.path(['event', 'target', 'value']))
    .startWith('')
  return {
    DOM: name$.map(text =>
      div([
        input({props: {type: 'text'}, on: {input: 'input'}}),
        h1('hello ' + text)
      ])
    )
  }
}

function mainFunctionMonadLaws (sources) { // eslint-disable-line
  const M = (main) => Main.of(main)
  const bind = (M, f) => Main.chain(f, M)
  const unit = Main.of

  const f = (main) => unit((sources) => ({
    DOM: most.combine(
      (...vdoms) => div([span('f('), ...vdoms, span(')')]),
      main(sources).DOM,
      main(sources).DOM
    )
  }))
  const g = (main) => unit((sources) => ({
    DOM: most.combine(
      (...vdoms) => div([span('g('), ...vdoms, span(')')]),
      main(sources).DOM,
      main(sources).DOM,
      main(sources).DOM
    )
  }))
  const _42 = (sources) => ({ DOM: most.of(b('42')) })
  const laws = [
    [ bind(M(_42), f), f(_42) ],
    [ bind(M(_42), unit), M(_42) ],
    [ bind(bind(M(_42), f), g), bind(M(_42), (x) => bind(f(x), g)) ]
  ]
  return vertical(
    laws.map((progs) => horizontal(progs.map(p => shadow(p))))
  )(sources)
}

function b_ (sources) { // eslint-disable-line
  const sinks1 = isolate(c)(sources)
  const sinks2 = isolate(c)(sources)
  return {
    DOM: most.combine(function (vdom1, vdom2, v1, v2) {
      return div([vdom1, vdom2, b(v1 + v2)])
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
        div('.c', [
          button({on: {click: '-1'}}, '-1'),
          button({on: {click: '1'}}, '+1'),
          b(i)
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
          (...vdoms) => div('.vertical', vdoms.map((vdom) => div('.item', [vdom]))),
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
        DOM: most.combineArray(
          (...vdoms) => div({ style }, vdoms),
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
          div('.shadow', {
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
