const debug = require('debug')
const $ = require('../$')
const {Cons} = require('../list')

const H$ = require('../barks/h$')
const {ReducerBark} = require('../barks/state')

const nRing = pith => h => {
  var i = 0
  const n = (sel, data = {}, initState) => shpith => {
    const key = 'rnode' + i++
    const state$ = ReducerBark()(initState)(s => {
      var hpith
      s.obj('state')(s => {
        const action$ = h.$.filter(x => x.vnode.data.path.head === key)
        hpith = shpith(s, action$)
      })
      s('pith', $(hpith).map(hpith => () => h => {
        h.vnode(
          H$(h.ring)(
            sel,
            $(data).map(d => Object.assign({path: h.path}, d)),
            Cons(key, h.path)
          )(h => {
            hpith(h, (selectors) => s.select(['state', ...selectors]))
          })
        )
      }))
    })
      .tap(debug('n:state$'))
      .multicast()

    h(
      'div.rnode',
      {key},
      state$.map(s => s.pith)
        .filter(f => typeof f === 'function')
        .skipRepeats()
    )
    return state$
      .map(s => s.state).filter(Boolean)
      .map(s => s.return).filter(a => typeof a !== 'undefined' && a !== null)
      .skipRepeats()
  }
  pith(Object.assign((...args) => h(...args), h, {
    ring: nRing,
    n
  }))
}

module.exports = nRing
