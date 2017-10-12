const debug = require('debug') // eslint-disable-line
const PatchBark = require('../barks/patch')

const nRing = require('../rings/n')
const apiRing = require('../rings/api')

PatchBark(p => nRing()(apiRing(p)))(document.getElementById('root-node'))((put, select) => {
  // put.text(select.action$.tap(debug('root')).map(x => x.action + '').startWith('n/a'))

  put.n('div.a', {}, 'a', (enter, sselect, vselect) => {
    enter.val('count', vselect.action$
      .filter(x => typeof x.action === 'number')
      .map(x => s => s + x.action)
      .startWith(s => s || 0))
    return showHideRing(put => {
      put.node('button', {on: {click: +1}}, put => put.text('+'))
      put.node('button', {on: {click: -1}}, put => put.text('-'))
      put.text(sselect.path(['count']).map(n => n + ''))

      put.n('div.b', {}, 'b', (enter, sselect, vselect) => {
        enter.val('count', vselect.action$
          .filter(x => typeof x.action === 'number')
          .map(x => s => s + x.action)
          .startWith(s => s || 0))
        return showHideRing(put => {
          put.node('button', {on: {click: +1}}, put => put.text('+'))
          put.node('button', {on: {click: -1}}, put => put.text('-'))
          put.text(sselect.path(['count']).map(n => n + ''))
        })
      })
    })
  })
})
  .tap(x => x.log())
  .drain()

function showHideRing (pith) {
  return function showHidePith (put, select) {
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
