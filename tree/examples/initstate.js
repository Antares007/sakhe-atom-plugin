module.exports = key => {
  var initState
  try {
    initState = JSON.parse(window.localStorage.getItem(key) || void 0)
  } catch (err) {}
  const proxy$ = {
    next: r => {
      const newState = r(initState)
      window.localStorage.setItem(key, JSON.stringify(newState))
      return newState
    }
  }
  return [initState, proxy$]
}
