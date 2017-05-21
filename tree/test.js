const debug = require('debug')
const m = require('most')
const h = require('snabbdom/h').default

function Form (Return = () => void 0) {
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
    Return(action$('add').map(() => state))
  }
}

function Me (Return = () => void 0) {
  return function ({action$}) {
    this.bark(h('div'), Form(add$ => add$.observe(debug('add$'))))
  }
}

const elm = document.getElementById('root-node')
const bark = require('./snabbdom-bark')

bark(
  elm,
  alterApi(
    coerceBarkRay(
      coercePutRay(
        mapRays(
          rays => ({
            action$: a => rays.$.filter(x => {
              if (typeof a === 'string') return x.action === a
              return !Object.keys(a).some(key => a[key] !== x.action[key])
            })
          }),
          Me()
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
        if (d < 3) this.bark(h('div'), Counter(d + 1))
      })
      this.bark(h('button', {on: {click: -1}}), function () {
        this.put('-')
        if (d < 3) this.bark(h('div'), Counter(d + 1))
      })
    })
  }
}

function mapRays (f, pith) {
  return function (rays) {
    pith.call(Object.assign({}, this, {
      bark: (vf$, pith) => this.bark(vf$, mapRays(f, pith))
    }), Object.assign({}, rays, f(rays)))
  }
}

function alterApi (pith) {
  return function ({put, bark, path, $}) {
    pith.call({
      put,
      bark: (vf$, pith) => bark(vf$, alterApi(pith))
    }, { path, $ })
  }
}

function coercePutRay (pith) {
  return function (...args) {
    pith.apply(Object.assign({}, this, {
      put: (...args) => {
        for (var i = 0; i < args.length; i++) {
          var a = args[i]
          this.put(a.sel || typeof a === 'string' ? m.of(a) : a)
        }
      },
      bark: (vf$, pith) => this.bark(vf$, coercePutRay(pith))
    }), args)
  }
}

function coerceBarkRay (pith) {
  return function (...args) {
    pith.apply(Object.assign({}, this, {
      bark: (x, pith) => this.bark(
        x.sel
        ? m.of(children => Object.assign({}, x, {children}))
        : x,
        coerceBarkRay(pith)
      )
    }), args)
  }
}
