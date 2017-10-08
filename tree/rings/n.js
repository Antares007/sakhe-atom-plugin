const debug = require('debug')
const {Cons} = require('../list')

const vnodeBark = require('../barks/vnode')
const {ReducerBark} = require('../barks/state')
const id = a => a
const putRing = require('./put')
const apiRing = require('./api')

const nRing = pith => (put, select) => {
  const action$ = select.action$
  var i = 0
  const n = (pmap = id) => (sel, data = {}, initState) => shpith => {
    const key = 'rnode' + i++
    const state$ = ReducerBark(p => putRing(apiRing(p)))(initState)((enter, select) => {
      const selectPath = select.path
      var hpith
      enter.obj('state', (enter) => {
        hpith = shpith(enter, {
          action$: action$.filter(x => x.vnode.data.path.head === key)
        })
      })
      enter.val('pith', select.$(hpith).map(hpith => () => (put, select) => {
        put.vnode(
          vnodeBark(pmap)(
            sel,
            select.$(data).map(d => Object.assign({path: select.path}, d)),
            Cons(key, select.path)
          )((put, select) => {
            hpith(put, Object.assign({}, select, {
              path: (selectors) => selectPath(['state', ...selectors])
            }))
          })
        )
      }))
    })
      .tap(debug('n:state$'))
      .multicast()

    put.node()('div.node', {key})(state$.map(s => s.pith)
                                        .filter(f => typeof f === 'function')
                                        .skipRepeats())
    return state$
      .map(s => s.state).filter(Boolean)
      .map(s => s.return).filter(a => typeof a !== 'undefined' && a !== null)
      .skipRepeats()
  }
  pith(Object.assign({}, put, {n}), select)
}

module.exports = nRing
