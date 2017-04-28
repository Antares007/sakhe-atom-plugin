const {Stream} = require('most')
const {hold} = require('@most/hold')

class StateSource extends Stream {
  constructor (state$) {
    super(state$.filter(s => !!s).thru(hold).source)
  }

  select (scope) {
    return new StateSource(this.map(state => state[scope]))
  }

  isolateSource (source, scope) {
    return source.select(scope)
  }

  isolateSink (reducer$, scope) {
    return reducer$.map(reducer => function isolated (state) {
      if (typeof state === 'undefined') return { [scope]: reducer(void 0) }
      const newState = reducer(state[scope])
      return newState === state[scope]
        ? state
        : Array.isArray(state)
          ? state.map((val, i) => i === Number(scope) ? newState : val)
          : Object.assign({}, state, { [scope]: newState })
    })
  }
}

module.exports = function makeStateDriver (state) {
  return function stateDriver (reducer$) {
    const state$ = reducer$
      .scan((state, reducer) => reducer(state), state)
      .skipRepeats()
    return new StateSource(state$)
  }
}
