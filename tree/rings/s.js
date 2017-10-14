const debug = require('debug') // eslint-disable-line
const m = require('most') // eslint-disable-line
const {sync} = require('most-subject')
const vnodeBark = require('../barks/vnode')
const {ReducerBark} = require('../barks/state')
const {Cons} = require('../list')
const id = a => a
const apiRing = require('../rings/api')
const rchain = (ft, k) => r => a => {
  const ak = a && a[k]
  const bk = r(ak)
  if (ak === bk) return a
  return Object.assign(ft(), a, {[k]: bk})
}

const addActionRing = action$ => pith => (put, select) =>
  pith(Object.assign({}, put, {
    node: (pmap = id) => put.node(p => addActionRing(action$)(pmap(p)))
  }), Object.assign({}, select, {
    action$: action$.filter(x => x.vnode.data.path.endsWith(select.path))
  }))

const svnodeBark =
(select, rproxy$ = {next: id}) =>
(pmap = id, spmap = apiRing) =>
(sel, dta, key, initState, ft) =>
svpith => {
  const ringPath = select.path
  const data = select.$(dta).map(d => Object.assign({}, d, {path: ringPath, key}))
  const path = Cons(key, ringPath)
  const action$ = select.action$.filter(x => x.vnode.data.path.endsWith(path))
  const vselect = Object.assign({}, select, { path, action$ })
  const rmap = (proxy$, f = id) => ({next: r => proxy$.next(s => f(r)(s))})

  return vnodeBark(addActionRing(action$))(sel, data, path)(
    ReducerBark(id)(initState, ft)((enter, sselect) => {
      const stateProxy$ = sync()
      enter.put(stateProxy$)

      const chieldRing = pith => (put, select) => {
        const snode =
        ft =>
        (pmap = id, spmap) =>
        (sel, dta, key) =>
        svpith => {
          put.vnode(
            sselect.path([key]).take(1).map(initState =>
              svnodeBark(
                select, rmap(stateProxy$, rchain(ft, key))
              )(
                pmap, spmap
              )(
                sel, dta, key, initState, ft
              )(
                svpith
              )
            ).switchLatest()
          )
        }
        return pmap(pith)(
          Object.assign({}, put, {
            node: (pmap = id) => put.node(p => chieldRing(pmap(p))),
            onode: snode(_ => ({})),
            anode: snode(_ => ([]))
          }),
          select
        )
      }
      enter.put(
        sselect.$(svpith(enter, sselect, vselect))
          .map(chieldRing)
          .map(pith => s => { s.pith = pith; return s })
      )
    })
    .tap(
      (o => a => {
        if (o === a) return
        debug(key + '/next')(a)
        o = a
        rproxy$.next(() => {
          if (!a.pith) return a
          const b = Object.assign(ft(), a)
          delete b.pith
          return b
        })
      })(void 0)
    )
    .map(s => s.pith)
    .filter(pith => typeof pith !== 'undefined')
    .skipRepeats()
  )
}

const sRing = pith => (put, select) => {
  const snode =
  ft =>
  (pmap, spmap = apiRing) =>
  (sel, dta, key, initState, proxy$) =>
  svpith =>
  put.vnode(
    svnodeBark(select, proxy$)(pmap, spmap)(sel, dta, key, initState, ft)(svpith)
  )
  return pith(
    Object.assign({}, put, {
      onode: snode(() => ({})),
      anode: snode(() => ([]))
    }),
    select
  )
}

module.exports = sRing
