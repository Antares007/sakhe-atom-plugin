const debug = require('debug')
const id = a => a

const showHideRing = pith => {
  const mkPith = isOpen$ => put => {
    put.node(
      'button',
      {on: {click: isOpen$}},
      isOpen$.map(show => put => put.text(show ? 'hide' : 'show'))
    )
    put.node('div', isOpen$.map(show => show ? pith : id))
  }
  return (put, select) => {
    if (!put.onode) {
      const isOpen$ = select.action$.filter(({action}) => action === isOpen$)
        .startWith(false)
      return mkPith(isOpen$)
    }
    put.onode('div.show-hide', {}, 'showHide', (enter, sselect, vselect) => {
      enter.val('isOpen',
        select.action$.filter(({action}) => action === isOpen$)
        .map(_ => s => !s)
      )
      const isOpen$ = sselect.path(['isOpen']).multicast()
      return mkPith(isOpen$)
    })
  }
}

module.exports = showHideRing
