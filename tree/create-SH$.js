const m = require('most')
const $ = require('./$')
const ATree = require('./atree')
// const { proxy } = require('most-proxy')

module.exports = createSH$

function createSH$ (S$, H$) {
  function chainRing (pith) {
    return function chainPith (node, leaf) {
      const s = (...args) => leaf(so => so(...args))
      s.o = (...args) => leaf(so => so.o(...args))
      s.a = (...args) => leaf(so => so.a(...args))
      pith(
        (sel, data, pith) => {
          const state$ = bark(sel, data, pith)
               .scan((s, r) => r(s), {})
               .map(s => s.node).filter(Boolean)
               .tap(x => console.log('aaa', x))
               .multicast()
          leaf(s => {
            s('node', state$.map(s => s.state).filter(Boolean).map(s => () => ({state: s})))
          })
          leaf(h => {
            h(state$.map(s => s.vnode$).filter(Boolean))
          })
        },
        (...args) => leaf(h => h(...args)),
        s
      )
    }
  }
// 551114920
// 598451888 shotiko
  function bark (sel, data, pith) {
    return $(pith).map(pith => ATree(
      cbs => S$('node', s => {
        runCbs(cbs, 's =>', s)
        s.o('state', s => runCbs(cbs, 'so =>', s))
        s('vnode$', H$(sel, data, h => runCbs(cbs, 'h =>', h)).map(a => s => a))
      }),
      chainRing(pith)
    )).switchLatest()
  }

  return (sel, data, pith) => bark(
    sel, data && pith ? data : {}, pith || data
  )
}

const {async: subject} = require('most-subject')
const action$ = subject()
const h$ = require('./create-h$')(action$)
const state$ = subject()
const s$ = require('./create-s$')(state$)
const sh$ = createSH$(s$, h$)

sh$('div', {}, m.of((sh, h, s) => {
  sh('button', {}, (sh, h, s) => {
    // h('hi')
    h('span', {}, (h) => {
      h('hi')
    })
    s('b', s => 3)
  })
  // h('hello')
  s('a', s => 42)
  s.a('aa', s => s(1, s => 43))
}))
.scan((s, r) => r(s), {})
.tap(x => console.log(JSON.stringify(x, null, '  ')))
.drain()

function runCbs (cbs, key, l) {
  return cbs.filter(cb => cb.toString().startsWith(key)).forEach(cb => cb(l))
}
