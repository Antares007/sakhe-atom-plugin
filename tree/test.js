const debug = require('debug')
const m = require('most')
const h = require('snabbdom/h').default
const vdomBark = require('./vdom-bark')

function Form () {
  return function ({action$}) {
    var state
    const state$ = action$('input').map(x => x.event.target.value)
        .scan((s, v) => v, 'A')
        .tap(s => { state = s })
        .multicast()
    this.put(
      state$.map(value =>
        h('input', {
          on: {input: 'input'},
          props: {type: 'text', value}
        })
      ),
      state$.map(value =>
        h('button', {
          on: {click: 'add'},
          props: {disabled: value.length === 0}
        }, 'add')
      )
    )
    this.return(action$('add').map(() => state))
  }
}

function Me () {
  return function ({action$}) {
    const [add$] = this.node(h('div'), Form())
    add$.observe(debug('add$'))
    this.put(
      vdomBark(m.of(children => h('div', children)), function () {
        this.put(m.of('hello'))
      })
    )
  }
}
function Counter (d = 0) { //eslint-disable-line
  return function pith ({path, action$}) {
    this.node(h('div', {style: {textAlign: 'center'}}), function () {
      const sum$ = action$(+1).merge(action$(-1))
        .scan((sum, x) => sum + x.action, 0)
      this.put(path, sum$)
      this.node(h('button', {on: {click: +1}}), function () {
        this.put('+')
        if (d < 3) this.node(h('div'), Counter(d + 1))
      })
      this.node(h('button', {on: {click: -1}}), function () {
        this.put('-')
        if (d < 3) this.node(h('div'), Counter(d + 1))
      })
    })
  }
}

const elm = document.getElementById('root-node')
const bark = require('./snabbdom-bark')

const addReturn = mapPith((pith) => function (...args) {
  pith.apply(Object.assign({}, this, {
    node: (vf$, pith) => {
      const rs = []
      this.node(vf$, function (...args) {
        pith.apply(Object.assign({}, this, {
          return: rs.push.bind(rs)
        }), args)
      })
      return rs
    }
  }), args)
})
const coerceBarkRay = mapPith(function (pith) {
  return function (...args) {
    pith.apply(Object.assign({}, this, {
      node: (x, pith) => this.node(
        x.sel
        ? m.of(children => Object.assign({}, x, {children}))
        : x,
        pith
      )
    }), args)
  }
})
const coercePutRay = mapPith(function (pith) {
  return function (...args) {
    pith.apply(Object.assign({}, this, {
      put: (...args) => {
        for (var i = 0; i < args.length; i++) {
          var a = args[i]
          this.put(a.sel || typeof a === 'string' ? m.of(a) : a)
        }
      }
    }), args)
  }
})

bark(elm,
  coerceBarkRay(
    coercePutRay(
      mapRays(rays => ({ action$: a => rays.$.filter(x => x.action === a) }),
        addReturn(
          Counter()
        )
      )
    )
  )
)

function mapRays (f, pith) {
  return mapPith(function (pith) {
    return function (rays) {
      pith.call(this, Object.assign({}, rays, f(rays)))
    }
  })(pith)
}

function mapPith (f) {
  return function rec (pith) {
    return f(function (...args) {
      pith.apply(Object.assign({}, this, {
        node: (vf$, pith) => this.node(vf$, rec(pith))
      }), args)
    })
  }
}
