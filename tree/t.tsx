import * as m from 'most'
import {h} from 'snabbdom'

export function CounterN (d = 3) {
  // return function ({n, l, path, action$}) {
  //   const sum$ = m.merge(action$(-1), action$(+1))
  //                 .scan((sum, x) => sum + (x as any).action, 0)
  //   this.put(sum$.map(sum => h('div', sum + '')))
  //   this.node('button', {on: {click: +1}}, ({n, l}) => {
  //     this.put('+')
  //     if (d > 0) this.node('div', CounterN(d - 1))
  //   })
  //   this.node(h('button', {on: {click: -1}}), ({n, l}) => {
  //     this.put('-')
  //     if (d > 0) this.put(m.of(CounterN(d - 1)))
  //   })
  // }
}
