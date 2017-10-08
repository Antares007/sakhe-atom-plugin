const m = require('most')
const $ = require('../$')
const mostBark = require('./most')
const {async: subject, hold} = require('most-subject')
const id = a => a
const cmp = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))

const c = (ft, k) => r => a => {
  const ak = a && a[k]
  const bk = r(ak)
  if (ak === bk) return a
  return Object.assign(ft(), a, {[k]: bk})
}

const ABark = (pmap = id) => (ft = () => ({})) => mostBark(pith => ({put}) => pmap(pith)({
  val: (key, r) => put($(r).map(c(ft, key))),
  obj: pmap => key => pith => put(ABark(pmap)(_ => ({}))(pith).map(c(ft, key))),
  arr: pmap => key => pith => put(ABark(pmap)(_ => ([]))(pith).map(c(ft, key)))
}))(m.mergeArray)

const stateRing = state$ => pith => {
  const select = ($, key) =>
    $.filter(s => typeof s !== 'undefined' && s !== null).map(s => s[key])
  return put => pith(Object.assign({}, put, {
    obj: (pmap = id) => key => put.obj(cmp(stateRing(select(state$, key)), pmap))(key),
    arr: (pmap = id) => key => put.arr(cmp(stateRing(select(state$, key)), pmap))(key)
  }), {
    path: selectors => selectors.reduce(select, state$)
      .filter(s => typeof s !== 'undefined')
      .skipRepeats()
  })
}

const ReducerBark =
  (pmap = require('../rings/api')) =>
  (initState = {}, ft = _ => ({})) =>
  (pith) => {
    const state$ = hold(1, subject())
    return ABark(cmp(stateRing(state$), pmap))(ft)(pith)
      .scan((s, r) => r(s), ft())
      .skip(1)
      .skipRepeats()
      .tap(state$.next.bind(state$))
      .flatMapEnd(() => { state$.complete(); return m.empty() })
      .multicast()
  }

module.exports = { ReducerBark }

if (require.main === module) {
  ReducerBark()()((s, select) => {
    s.val('a', s => 'b')
    s.obj('o', s => {
      s.val('a', s => 'b')
    })
    s.arr('arr', (s, select) => {
      s.val(1, s => 42)
    })
    select.path(['arr', 1]).observe(x => console.log(x))
  })
  .tap(x => console.log(x))
  .take(10)
  .drain()
}
