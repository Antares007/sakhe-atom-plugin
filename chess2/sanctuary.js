const $ = require('sanctuary-def')
const type = require('sanctuary-type-identifiers')
const Z = require('sanctuary-type-classes')
const def = $.create({checkTypes: true, env: $.env})
const add = def('add', {}, [$.Number, $.Number, $.Number], (x, y) => x + y)
const addS = def('addS', {}, [$.String, $.String, $.String], (x, y) => x + y)

console.log(addS($.__, '!')('hey'))

const a = $.TypeVariable('a')
const b = $.TypeVariable('b')


// pairTypeIdent :: String
const pairTypeIdent = 'my-package/Pair'

//    $Pair :: Type -> Type -> Type
const $Pair = $.BinaryType(
  pairTypeIdent,
  'http://example.com/my-package#Pair',
  x => type(x) === pairTypeIdent,
  pair => [pair[0]],
  pair => [pair[1]]
)

//    PairTypeRep :: TypeRep Pair
const PairTypeRep = {'@@type': pairTypeIdent}

//    Pair :: a -> b -> Pair a b
const Pair = def('Pair', {}, [a, b, $Pair(a, b)], (x, y) => ({
  '0': x,
  '1': y,
  constructor: PairTypeRep,
  length: 2,
  toString: () => 'Pair(' + Z.toString(x) + ', ' + Z.toString(y) + ')'
}))

//    Rank :: Type
const Rank = $.NullaryType(
  'my-package/Rank',
  'http://example.com/my-package#Rank',
  x => typeof x === 'string' && /^([A23456789JQK]|10)$/.test(x)
)

//    Suit :: Type
const Suit = $.NullaryType(
  'my-package/Suit',
  'http://example.com/my-package#Suit',
  x => typeof x === 'string' && /^[\u2660\u2663\u2665\u2666]$/.test(x)
)

//    Card :: Type
const Card = $Pair(Rank, Suit)

//    showCard :: Card -> String
const showCard = def('showCard', {}, [Card, $.String], card => card[0] + card[1])

console.log(showCard(Pair('A', '♠')))
// => 'A♠'

// showCard(Pair('X', '♠'))
// ! TypeError: Invalid value
//
//   showCard :: Pair Rank Suit -> String
//                    ^^^^
//                     1
//
//   1)  "X" :: String
//
//   The value at position 1 is not a member of ‘Rank’.
