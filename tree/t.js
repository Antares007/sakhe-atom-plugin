const {async: subject} = require('most-subject')
const action$ = subject()
const h$ = require('./create-h$')(action$)
const state$ = subject()
const s$ = require('./create-s$')(state$)
const sh$ = require('./create-sh$')(s$, h$)

sh$('div', {}, (n, l) => {
  l('hello')
})
.scan((s, r) => r(s), {})
.tap(x => console.log(JSON.stringify(x)))
.drain()
