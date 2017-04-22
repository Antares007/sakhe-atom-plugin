let knightPosition = [1, 7]
let observer = null

const api = {
  observe (o) {
    if (observer) {
      throw new Error('Multiple observers not implemented.')
    }
    observer = o
    emitChange()
  },
  moveKnight (toX, toY) {
    if (!api.canMoveKnight(toX, toY)) return
    knightPosition = [toX, toY]
    emitChange()
  },
  canMoveKnight (toX, toY) {
    const [x, y] = knightPosition
    const dx = toX - x
    const dy = toY - y

    return (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
           (Math.abs(dx) === 1 && Math.abs(dy) === 2)
  }
}
module.exports = api

function emitChange () {
  observer(knightPosition)
}
