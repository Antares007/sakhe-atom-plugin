class Main2 { // eslint-disable-line
  constructor (main) {
    this.main = main
  }

  map (fn) {
    return this.flatMap((main) => Main.of(fn(main)))
  }

  flatMap (fn) {
    return Main2.of((sources) => {
      var mergedSinks = {}
      const main = makeMemoizer()((sourcesFromMapper) => {
        for (let key in sourcesFromMapper) {
          if (sources[key]) throw new Error('cant merge sources')
        }
        const sinks = this.main(Object.assign({}, sources, sourcesFromMapper))
        mergedSinks = mergeSources(mergedSinks, sinks)
        return sinks
      })
      const sinks = fn(main).valueOf()(sources)
      return Object.assign(mergedSinks, sinks)
    })
  }

  valueOf () {
    return this.main
  }

  static of (main) {
    return new Main2(main)
  }
}

const multicastSources = (sources) => Object.keys(sources).reduce((s, key) => {
  s[key] = sources[key].multicast ? sources[key].multicast() : sources[key]
  return s
}, {})

const Main = {
  of (main) {
    return main
  },
  chainArray (fn, mainFns) {
    return function (sources) {
      sources = multicastSources(sources)
      const chainLength = mainFns.length
      const sinksAArray = new Array(chainLength)
      const mainProxies = new Array(chainLength)
      for (let i = 0; i < mainFns.length; i++) {
        mainProxies[i] = function (sources_) {
          const sinks_ = mainFns[i](Object.assign({}, sources, sources_))
          sinksAArray[i] = sinksAArray[i] || []
          sinksAArray[i].push(sinks_)
          return sinks_
        }
      }

      var outputSinks = fn(mainProxies)(sources)

      const mergedSinks = {}

      for (let i = 0; i < chainLength; i++) {
        const sinksArray = sinksAArray[i]
          ? sinksAArray[i]
          : [mainFns[i](sources)]
        for (var j = 0; j < sinksArray.length; j++) {
          const sinks_ = sinksArray[j]
          for (var key in sinks_) {
            mergedSinks[key] = mergedSinks[key]
              ? mergedSinks[key].merge(sinks_[key])
              : sinks_[key]
          }
        }
      }

      return Object.assign({}, mergedSinks, outputSinks)
    }
  },
  chain (fn, mainFn) {
    return Main.chainArray(([mainFn]) => fn(mainFn), [mainFn])
  }
}

module.exports = Main

function mergeSources (...sourcesArray) {
  const to = {}
  for (let sources in sourcesArray) {
    for (let key in sources) {
      to[key] = to[key] ? to[key].merge(sources[key]) : sources[key]
    }
  }
  return to
}

function makeMemoizer (cache = new Map()) {
  return (mainFn) => (sources) => {
    if (cache.has(sources)) return cache.get(sources)
    const sinks = mainFn(sources)
    cache.set(sources, sinks)
    return sinks
  }
}

// const mergeSources = (fn, xs) => {
//   const rez = xs.reduce((s, sinks) => Object.keys(sinks).reduce((s, key) => {
//     s[key] = s[key] || []
//     s[key].push(sinks[key])
//     return s
//   }, s), {})
//   return Object.keys(rez).reduce((s, key) => {
//     s[key] = fn(rez[key])
//     return s
//   }, {})
// }
