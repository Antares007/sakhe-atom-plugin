const debug = require('debug')
const apiRing = require('../rings/api')
const sRing = require('../rings/s')
const PatchBark = require('../barks/patch')

function Counter (d = 3, key = 'Counter') {
  return (put, select) => {
    put.onode('div.counter', {}, key, (enter, sselect, vselect) => {
      debug(d + '/spith')({enter, sselect, vselect})
      enter.val('count', vselect.action$
        .filter(x => typeof x.action === 'number')
        .map(x => s => s + x.action)
        .startWith(s => s || 0)
      )
      return showHideRing(put => {
        debug(d + '/vpith')({put})
        put.node('button', {on: {click: +1}}, put => {
          put.text('+')
          if (d > 0) put.node('div', {}, Counter(d - 1, key + '/+'))
        })
        put.node('button', {on: {click: -1}}, put => {
          put.text('-')
          if (d > 0) put.node('div', {}, Counter(d - 1, key + '/-'))
        })
        put.text(sselect.path(['count']).map(n => n + ''))
      })
    })
  }
}
PatchBark(p => sRing(apiRing(p)))(
  document.getElementById('root-node')
)(
  Counter()
)
  // .tap(x => x.log())
  .drain()

function showHideRing (pith) {
  return function showHidePith (put, select) {
    debug('showHidePith')({put, select})
    const key = 'showHideRing'
    put.onode('div.showHide', {}, key, (enter, sselect, vselect) => {
      const showHide$ = select.action$
        .filter(({action}) => action === showHide$)
      enter.val('isOpen', showHide$.map(_ => s => !s))
      return put => {
        put.node(
          'button',
          {on: {click: showHide$}},
          sselect.path(['isOpen']).map(show => put => put.text(show ? 'hide' : 'show'))
        )
        put.node('div', sselect.path(['isOpen'])
          .map(show => show ? pith : put => {})
        )
      }
    })
  }
}
