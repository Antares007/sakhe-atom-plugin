const debug = require('debug')
const m = require('most')
const h = require('snabbdom/h').default

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
    const [add$] = this.bark(h('div'), Form())
    const [add2$] = this.bark(h('div'), Form())
    add$.observe(debug('add$'))
    add2$.observe(debug('add2$'))
  }
}

const elm = document.getElementById('root-node')
const bark = require('./snabbdom-bark')

const addReturn2 = mapPith((pith) => function (...args) {
  pith.apply(Object.assign({}, this, {
    bark: (vf$, pith) => {
      const rs = []
      this.bark(vf$, function (...args) {
        pith.apply(Object.assign({}, this, {
          return: rs.push.bind(rs)
        }), args)
      })
      return rs
    }
  }), args)
})

bark(
  elm,
  coerceBarkRay(
    coercePutRay(
      mapRays(rays => ({ action$: a => rays.$.filter(x => x.action === a) }),
        addReturn2(
          Counter()
        )
      )
    )
  )
)

function Counter (d = 0) { //eslint-disable-line
  return function pith ({path, action$}) {
    this.bark(h('div', {style: {textAlign: 'center'}}), function () {
      const sum$ = action$(+1).merge(action$(-1))
        .scan((sum, x) => sum + x.action, 0)
      this.put(path, sum$)
      this.bark(h('button', {on: {click: +1}}), function () {
        this.put('+')
        if (d < 2) this.bark(h('div'), Counter(d + 1))
      })
      this.bark(h('button', {on: {click: -1}}), function () {
        this.put('-')
        if (d < 2) this.bark(h('div'), Counter(d + 1))
      })
    })
  }
}

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
        bark: (vf$, pith) => this.bark(vf$, rec(pith))
      }), args)
    })
  }
}

function coercePutRay (pith) {
  return mapPith(function (pith) {
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
  })(pith)
}

function coerceBarkRay (pith) {
  return mapPith(function (pith) {
    return function (...args) {
      pith.apply(Object.assign({}, this, {
        bark: (x, pith) => this.bark(
          x.sel
          ? m.of(children => Object.assign({}, x, {children}))
          : x,
          pith
        )
      }), args)
    }
  })(pith)
}
