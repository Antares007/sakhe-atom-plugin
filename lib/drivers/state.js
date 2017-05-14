const most = require('most')
const rootnode = require('../rootnode.js')
rootnode(
  function ([g, $]) {
    g(most.of(() => 'root'))
    g(most.of((s) => s + '!'))
    $.observe(x => console.log(x))
    this.node(function ([g, $]) {
      $.observe(x => console.log(x))
      g(most.of(() => 0))
      g(most.of((s) => s + '!'))
      this.node(function ([g, $]) {
        $.observe(x => console.log(x))
        g(most.of(() => 1))
        g(most.of((s) => s + '!'))
      })
    })
  },
  most.mergeArray,
  r => {
    return most.of()
      .map(() => r()).chain(most.from)
      .scan((s, r) => r(s), void 0)
      .skip(1)
      .multicast()
  }
)

// const {Source, Sink} = require('../source')
// class ReducerSink extends Sink {
//   isolate (scope) {
//     return this.contramap($ => $.map(r => s => {
//       if (!s) return { '@': { [scope]: r(void 0) } }
//       if (s['@']) {
//         const ns = r(s['@'][scope])
//         if (ns === s['@'][scope]) return s
//         return Object.assign({}, s, {
//           '@': Object.assign({}, s['@'], { [scope]: ns })
//         })
//       }
//       return Object.assign({}, s, { '@': { [scope]: r(void 0) } })
//     }))
//   }
//
//   sink ($) {
//     super.sink($.map(r => s => {
//       if (!s) return { a: r(void 0) }
//       if (s.a) {
//         const a = r(s.a)
//         if (a === s.a) return s
//         return Object.assign({}, s, { a })
//       }
//       return Object.assign({}, s, { a: r(void 0) })
//     }))
//   }
//   combine (f) {
//     return super.combine(cb => most.defaultScheduler.asap({ run: cb }), f)
//   }
// }
// class StateSource extends Source {
//   constructor ($) {
//     super($.filter(x => typeof x !== 'undefined').skipRepeats())
//   }
//   isolate (scope) {
//     return this.map($ => $.map(state => state['@'] && state['@'][scope]))
//   }
//   get state$ () {
//     return this.$.map(state => state.a).filter(x => typeof x !== 'undefined').skipRepeats()
//   }
// }
//
