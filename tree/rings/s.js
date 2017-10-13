const debug = require('debug') // eslint-disable-line
const {sync} = require('most-subject')
const vnodeBark = require('../barks/vnode')
const {ReducerBark} = require('../barks/state')
const {Cons} = require('../list')
const id = a => a
const apiRing = require('../rings/api')

const addActionRing = action$ => pith => (put, select) =>
  pith(Object.assign({}, put, {
    node: (pmap = id) => put.node(p => addActionRing(action$)(pmap(p)))
  }), Object.assign({}, select, {
    action$: action$.filter(x => x.vnode.data.path.endsWith(select.path))
  }))

const svnodeBark = (select, initState = {initStates: {}}, reduce = id, spmap = apiRing) =>
(pmap = id) => (sel, dta, key) => svpith => {
  const ringPath = select.path
  const data = select.$(dta).map(d => Object.assign({}, d, {path: ringPath, key}))
  const path = Cons(key, ringPath)
  const action$ = select.action$.filter(x => x.vnode.data.path.endsWith(path))
  const vselect = Object.assign({}, select, {
    path,
    action$
  })
  const vnode$ = vnodeBark(addActionRing(action$))(sel, data, path)(
    ReducerBark(id)(initState)((enter, select) => {
      var vpith
      const stateProxy$ = sync()
      enter.val('initStates', stateProxy$)

      enter.obj(spmap)('state')((enter, sselect) => {
        vpith = svpith(enter, sselect, vselect)
      })

      const selectPath = select.path
      const chieldRing = pith => (put, select) => pmap(pith)(
        Object.assign({}, put, {
          node: (pmap = id) => put.node(p => chieldRing(pmap(p))),
          snode: (pmap = id) => (sel, data, key) => svpith => {
            put.vnode(
              selectPath(['initStates', key]).take(1).map(initState =>
                svnodeBark(
                  select,
                  initState,
                  r => stateProxy$.next(
                    s => Object.assign({}, s, {[key]: r(s && s[key])})
                  ),
                  spmap
                )(pmap)(sel, data, key)(svpith)
              ).switchLatest()
            )
          }
        }),
        select
      )
      enter.val('pith', select.$(vpith).map(chieldRing).map(_ => () => _))
    })
      .tap(debug(key + '/S'))
      .tap(({state, initStates}) => reduce(lastState => (
        lastState && lastState.state === state && lastState.initStates === initStates
        ? lastState
        : {state, initStates}
      )))
      .map(s => s.pith)
      .filter(pith => typeof pith !== 'undefined')
      .skipRepeats()
  )
  return vnode$
}

const sRing = (initStates = {}, reduce = id) => pith => (put, select) => pith(
  Object.assign({}, put, {
    node: (pmap = id) => put.node(p => sRing(initStates, reduce)(pmap(p))),
    snode: (pmap = id) => (sel, data, key) => svpith => {
      put.vnode(
        svnodeBark(
          select,
          initStates[key],
          r => reduce(s => Object.assign({}, s, {[key]: r(s && s[key])}))
        )(apiRing)(sel, data, key)(svpith)
      )
    }
  }),
  select
)

module.exports = sRing
