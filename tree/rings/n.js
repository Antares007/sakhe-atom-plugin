// const m = require('most')
const {sync} = require('most-subject')
const debug = require('debug') // eslint-disable-line
const {Cons} = require('../list')

const vnodeBark = require('../barks/vnode')
const {ReducerBark} = require('../barks/state')
const id = a => a
const eq = require('../eq')

const addActionRing = action$ => pith => (put, select) =>
  pith(Object.assign({}, put, {
    node: (pmap = id) => put.node(p => addActionRing(action$)(pmap(p)))
  }), Object.assign({}, select, {
    action$: action$.filter(x => x.vnode.data.path.endsWith(select.path))
  }))

const nRing = (initStates = {}, stateCb = () => {}, spmap = require('./api')) =>
pith => (put, select) => {
  const n = (pmap = id) => (sel, dta, key) => shpith => {
    const ringPath = select.path
    const data = select.$(dta).map(d => Object.assign({}, d, {path: ringPath}))
    const path = Cons(key, ringPath)
    const action$ = select.action$.filter(x => x.vnode.data.path.endsWith(path))
    const vselect = Object.assign({}, select, {
      path,
      action$
    })
    const vnode$ = vnodeBark(addActionRing(action$))(sel, data, path)(
      ReducerBark(spmap)(initStates[key] || {initStates: {}})((enter, select) => {
        debug(key + '/shpith')(shpith)
        var hpith
        const stateProxy$ = sync()
        enter.val('initStates', stateProxy$
          .skipRepeatsWith((a, b) => eq(a, b, 2))
          .map(([key, state]) => s => Object.assign({}, s, {[key]: state})
        ))
        enter.obj('state', (enter, sselect) => {
          hpith = shpith(enter, sselect, vselect)
        })
        const chieldRing = pith => initStates => (put, select) => pmap(hpith)(
          Object.assign({}, put, {
            node: (pmap = id) => put.node(p => nRing(initStates, stateCb, spmap)(pmap(p))),
            n: (pmap = id) => (sel, data, key) => shpith => {
              put.n(pmap)(sel, data, key)(shpith)
            }
          }),
          select
        )
        enter.val('pith', select.$(hpith).chain(hpith =>
          select.path(['initStates'])
            .take(1)
            .tap(debug(key + '/initStates'))
            .map(chieldRing(pith))
            .map(pith => () => pith)
        ))
      })
        .tap(debug(key + '/state'))
        .tap(state => stateCb([
          key,
          Object.keys(state).reduce((s, k) => {
            if (typeof state[k] === 'function') return s
            s[k] = state[k]
            return s
          }, {})
        ]))
        .map(s => s.pith)
        .filter(pith => typeof pith === 'function')
        .skipRepeats()
    )
    put.vnode(vnode$)
  }
  pith(Object.assign({}, put, {
    node: (pmap = id) => put.node(p => nRing(initStates, stateCb, spmap)(pmap(p))),
    n
  }), select)
}

module.exports = nRing
