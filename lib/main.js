const isolate = (fn) => fn // require('./isolate')

const Main = {
  of (main) {
    return main
  },
  chainArray (fn, args) {
    return function (sources) {
      const chainLength = args.length
      const sinksAArray = new Array(chainLength)
      const mainProxies = new Array(chainLength)
      for (let i = 0; i < args.length; i++) {
        mainProxies[i] = function (sources_) {
          const sinks_ = isolate(args[i])(Object.assign({}, sources, sources_))
          sinksAArray[i] = sinksAArray[i] || []
          sinksAArray[i].push(sinks_)
          return sinks_
        }
      }

      var outputSinks = fn(mainProxies)(sources)

      const mergedSinks = {}

      for (let i = 0; i < chainLength.length; i++) {
        const sinksArray = sinksAArray[i]
          ? sinksAArray[i]
          : [isolate(args[i])(sources)]
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
  chain (fn, ...args) {
    return Main.chainArray((mains) => fn(...mains), args)
  }
}

module.exports = Main
