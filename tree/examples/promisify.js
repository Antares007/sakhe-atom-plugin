module.exports = f => (...args) => new Promise(
  (resolve, reject) => f(
    ...args,
    (err, value) => err ? reject(err) : resolve(value)
  )
)
