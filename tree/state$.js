const $ = require('./$')
const m = require('most')
const ATree = require('./atree')
const scope = key => r => s => {
  s[key] = r(s[key])
  return s
}

module.exports = pith => State$(pith).scan((s, r) => r(s)).skip(1)

function State$ (pith, initState = {}, key = void 0) {
  return $(pith).map(pith => ATree(
    reduce$s => m.mergeArray(reduce$s).startWith(() => initState),
    function (_, leaf) {
      pith(
        (key, type, pith) => leaf(
          $(key)
            .flatMap(key => State$(pith, type, key)
            .map(scope(key)))
        ),
        (key, r) => leaf($(key).flatMap(key => $(r).map(scope(key)))),
        key
      )
    }
  )).switchLatest()
}

if (require.main === module) {
  State$((n, l) => {
    n('b', {}, (n, l) => {
      l('c', s => 1)
    })
    n('b2', [], (n, l) => {
      l(10, s => 1)
    })
    l('a', s => 1)
  })
  .scan((s, r) => r(s))
  .skip(1)
  .tap(s => console.log(JSON.stringify(s)))
  .drain()
}
