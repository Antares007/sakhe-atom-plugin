const most = require('most')
const {Stream} = most
const {hold} = require('@most/hold')

class StateSource extends Stream {
  constructor (state$) {
    super(state$.filter(x => x !== undefined).skipRepeats().thru(hold).source)
  }
  isolate (scope) {
    return new StateSource(this.map(state => state[scope]))
  }
  isolateSink (scope, reducer$) {
    return reducer$.map(reducer => (state) => {
      if (typeof state === 'undefined') return { [scope]: reducer(void 0) }
      const oldState = state[scope]
      const newState = reducer(oldState)
      return newState === oldState
        ? state
        : Object.assign({}, state, { [scope]: newState })
    }).multicast()
  }
}

module.exports = function makeStateDriver (state) {
  return function stateDriver (reducer$) {
    const state$ = most.never().multicast()
    reducer$
      .scan((state, reducer) => reducer(state), state)
      .tap((s) => {
        this.scheduler.asap(most.PropagateTask.event(s, state$.source))
      }).drain()
    return new StateSource(state$)
  }
}
