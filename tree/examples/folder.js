const m = require('most')
const debug = require('debug')
const watch$ = require('./watch$')
const {ReducerBark} = require('../barks/state')

const {join: pathJoin} = require('path')

const eq = require('../eq')
const PatchBark = require('../barks/patch')
const cssRing = require('../rings/css')
const apiRing = require('../rings/api')

PatchBark(p => cssRing(apiRing(p)))(document.getElementById('root-node'))(
  Folder(pathJoin(__dirname, '../..'))
)
.tap(debug('patch'))
.drain()

function Folder (path, stateCb = () => {}, initState = { initStates: {}, op: {} }) {
  const {sync} = require('most-subject')

  return (put, select) => {
    const change$ = watch$(path)
      .skipRepeatsWith(eq)
      .multicast()
    const opAction$ = select.action$
      .filter(x => x.action[0] === path)
      .map(x => x.action.slice(1))

    put.node(
      'ul',
      {style: select.css$` list-style-type: none; `},
      ReducerBark()(initState)((enter, select) => {
        const stateProxy$ = sync()
        enter.val(
          'initStates',
          stateProxy$
            .skipRepeatsWith(eq)
            .map(([name, {initStates, op}]) => [name, {initStates, op}])
            .map(([name, state]) => s => Object.assign({}, s, {[name]: state}))
        )

        enter.val('op', opAction$.map(([name, isOpen]) => s =>
          Object.assign({}, s, {[name]: isOpen})
        ))

        enter.val('pith', change$.map(dir => () => (put) => {
          debug(path.slice(0, __dirname.length) + '/pith')(dir)
          for (let name in dir) {
            let stat = dir[name]
            let epath = pathJoin(path, name)
            let actClose = [path, name, false]
            let actOpen_ = [path, name, true]
            const isOpen$ = select.path(['op', name])
            const initState$ = select.path(['initStates', name]).take(1)
            put.node('li', {key: name}, (put, select) => {
              if (stat.isDirectory()) {
                put.node('div', isOpen$.map(op => (
                    op
                    ? put => {
                      put.node('button', {on: {click: actClose}}, put => put.text('- ' + name))
                      put.node('div', {},
                        initState$.map(initState =>
                          Folder(epath, state => stateProxy$.next([name, state]), initState)
                        )
                      )
                    }
                    : put => put.node('button', {on: {click: actOpen_}}, put => put.text('+ ' + name))
                  ))
                )
              } else {
                put.text(name)
              }
            })
          }
        }))
      })
        .tap(s => stateCb(s))
        .map(s => s.pith)
        .filter(Boolean)
        .skipRepeats()
    )
  }
}
