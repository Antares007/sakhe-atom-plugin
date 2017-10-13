const debug = require('debug')
const apiRing = require('../rings/api')
const sRing = require('../rings/s')
const PatchBark = require('../barks/patch')

PatchBark(p => sRing()(apiRing(p)))(document.getElementById('root-node'))((put, select) => {
  const n = (put, k) => put.snode('div.' + k, {}, k, (enter, sselect, vselect) => {
    debug(k + '/spith')({enter, sselect, vselect})
    enter.val('count', vselect.action$
      .filter(x => typeof x.action === 'number')
      .map(x => s => s + x.action)
      .startWith(s => s || 0))
    return showHideRing(put => {
      debug(k + '/vpith')({put})
      put.node('button', {on: {click: +1}}, put => put.text('+'))
      put.node('button', {on: {click: -1}}, put => put.text('-'))
      put.text(sselect.path(['count']).map(n => n + k))
    })
  })
  n(put, 'a')
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
