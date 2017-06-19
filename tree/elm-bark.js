const ATree = require('./atree')
const m = require('most')

function ElmBark (ed$, pith) {
  const applyData = ed$ => ed$.scan(([oldElm, oldData], [elm, data]) => {
    Object.assign(
      elm.style,
      Object.keys(oldData.style || {}).reduce((s, k) => { s[k] = ''; return s }, {}),
      data.style || {}
    )
    Object.keys(oldData.props || {}).forEach(key => { delete elm[key] })
    Object.assign(elm, data.props || {})
    return [elm, data]
  }, [void 0, {}]).skip(1).map(x => x[0]).skipRepeats()

  return ATree(
    e$s => m.combineArray((elm, ...children) => [elm, children], [applyData(ed$), ...e$s])
      .scan(([oldElm, oldChildren], [elm, children]) => {
        if (!oldElm) {
          for (let i = 0, len = children.length; i < len; i++) elm.appendChild(children[i])
          return [elm, children]
        }
        if (oldElm !== elm) {
          for (let i = 0, len = oldChildren.length; i < len; i++) oldElm.removeChild(oldChildren[i])
          for (let i = 0, len = children.length; i < len; i++) elm.appendChild(children[i])
          return [elm, children]
        }
        for (let i = 0, len = children.length; i < len; i++) {
          if (oldChildren[i] !== children[i]) {
            elm.insertBefore(children[i], oldChildren[i])
            elm.removeChild(oldChildren[i])
          }
        }
        return [elm, children]
      }, [void 0, []]).skip(1).map(x => x[0]).skipRepeats()
  )(function (put) {
    pith(ed$ => put(applyData(ed$)))
  }).skipRepeats()
}

function H (elm, data, pith) {
  const cmb$ = (...args) => m.combineArray(
    (...array) => array,
    args.map(a => a && a.source ? a : m.of(a))
  )
  return ElmBark(cmb$(typeof elm === 'string' ? document.createElement(elm) : elm, data), function (put) {
    pith((elm, data = {}) => put(
      cmb$(typeof elm === 'string' ? document.createElement(elm) : elm, data)
    ))
  })
}

const af$ = m.periodic(1000)
  .skip(1)
  .take(1)
  .chain(() => require('./animation-frame.js'))
// const i$ = af$.scan(a => a + 1, 0)
const cycle$ = af$.scan(i => i >= Math.PI * 2 ? 0 : i + (0.3), 0)
const sin$ = cycle$.map(i => Math.sin(i)).multicast()
// const cos$ = cycle$.map(i => Math.cos(i))

H(document.getElementById('root-node'), {}, Tree()).drain()

function Tree (d = 1, w = 1) { //eslint-disable-line
  return (h) => {
    h('button', {props: {innerText: 'path'}})
    for (var i = 0; i < w; i++) {
      if (d > 0) {
        h(H('div', sin$.map(y => ({
          props: {className: 'n'},
          style: {paddingLeft: Math.floor(y * 10 + 10) + 'px'}
        })), Tree(d - 1, w)))
      }
    }
  }
}
