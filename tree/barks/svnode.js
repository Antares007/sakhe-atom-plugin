const debug = require('debug') // eslint-disable-line
// const m = require('most')
const {sync} = require('most-subject')
const vnodeBark = require('../barks/vnode')
const {ReducerBark} = require('../barks/state')
const {Cons} = require('../list')
const id = a => a
const eq = require('../eq')
const apiRing = require('../rings/api')

const addActionRing = action$ => pith => (put, select) =>
  pith(Object.assign({}, put, {
    node: (pmap = id) => put.node(p => addActionRing(action$)(pmap(p)))
  }), Object.assign({}, select, {
    action$: action$.filter(x => x.vnode.data.path.endsWith(select.path))
  }))

const svnodeBark = (select, initState = {initStates: {}}, stateCb = id, spmap = apiRing) =>
(pmap = id) => (sel, dta, key) => svpith => {
  const ringPath = select.path
  const data = select.$(dta).map(d => Object.assign({}, d, {path: ringPath, key}))
  const path = Cons(key, ringPath)
  const action$ = select.action$.filter(x => x.vnode.data.path.endsWith(path))
  const vselect = Object.assign({}, select, {
    path,
    action$
  })
  var lastState
  const publishState = state => {
    if (eq(lastState, state, 2)) return
    const nstate = Object.assign({}, state)
    delete nstate.pith
    stateCb(nstate)
    lastState = nstate
  }
  const vnode$ = vnodeBark(addActionRing(action$))(sel, data, path)(
    ReducerBark(id)(initState)((enter, select) => {
      var vpith
      const stateProxy$ = sync()
      const next = stateProxy$.next.bind(stateProxy$)
      enter.val('initStates', stateProxy$
        // .skipRepeatsWith((a, b) => eq(a, b, 2))
        .map(([key, state]) => s => Object.assign({}, s, {[key]: state}))
      )
      enter.obj(spmap)('state')((enter, sselect) => {
        vpith = svpith(enter, sselect, vselect)
      })
      const selectPath = select.path
      enter.val('pith', select.$(vpith)
                .map(vpith =>
                  (function map (pith) {
                    return (put, select) => pmap(pith)(
                      Object.assign({}, put, {
                        node: (pmap = id) => put.node(p => map(pmap(p))),
                        snode: (pmap = id) => (sel, data, key) => svpith => {
                          put.vnode(
                            selectPath(['initStates', key]).take(1).map(initState =>
                              svnodeBark(
                                select,
                                initState,
                                s => next([key, s]),
                                spmap
                              )(pmap)(sel, data, key)(svpith)
                            ).switchLatest()
                          )
                        }
                      }),
                      select
                    )
                  })(vpith)
                ).map(pith => () => pith)
      )
    }).tap(debug(key + '/state'))
      .tap(publishState)
      .map(s => s.pith)
      .filter(pith => typeof pith !== 'undefined')
      .skipRepeats()
  )
  return vnode$
}

module.exports = svnodeBark

const PatchBark = require('../barks/patch')
window.eq = eq
PatchBark()(document.getElementById('root-node'))((put, select) => {
  put.vnode(svnodeBark(select)(apiRing)('div.a', {}, 'a')((enter, sselect, vselect) => {
    debug('a/spith')({enter, sselect, vselect})
    enter.val('count', vselect.action$
      .filter(x => typeof x.action === 'number')
      .map(x => s => s + x.action)
      .startWith(s => s || 0))
    return showHideRing(put => {
      debug('a/vpith')({put})
      put.node('button', {on: {click: +1}}, put => put.text('+'))
      put.node('button', {on: {click: -1}}, put => put.text('-'))
      put.text(sselect.path(['count']).map(n => n + ''))

      put.snode('div.b', {}, 'b', (enter, sselect, vselect) => {
        debug('b/spith')({enter, sselect, vselect})
        enter.val('count', vselect.action$
          .filter(x => typeof x.action === 'number')
          .map(x => s => s + x.action)
          .startWith(s => s || 0))
        return showHideRing(put => {
          debug('b/vpith')({put})
          put.node('button', {on: {click: +1}}, put => put.text('+'))
          put.node('button', {on: {click: -1}}, put => put.text('-'))
          put.text(sselect.path(['count']).map(n => n + ''))

          put.snode('div.c', {}, 'c', (enter, sselect, vselect) => {
            debug('c/spith')({enter, sselect, vselect})
            enter.val('count', vselect.action$
              .filter(x => typeof x.action === 'number')
              .map(x => s => s + x.action)
              .startWith(s => s || 0))
            return showHideRing(put => {
              debug('c/vpith')({put})
              put.node('button', {on: {click: +1}}, put => put.text('+'))
              put.node('button', {on: {click: -1}}, put => put.text('-'))
              put.text(sselect.path(['count']).map(n => n + ''))
            })
          })
        })
      })
    })
  }))
})
  .tap(x => x.log())
  .drain()

function showHideRing (pith) {
  return function showHidePith (put, select) {
    debug('showHidePith')({put, select})
    const showHide$ = select.action$
      .filter(({action}) => action === showHide$)
      .scan(b => !b, false).multicast()
    put.node(
      'button',
      {on: {click: showHide$}},
      showHide$.map(show => put => put.text(show ? 'hide' : 'show'))
    )
    put.node('div', showHide$.map(show => show ? pith : put => {}))
  }
}
