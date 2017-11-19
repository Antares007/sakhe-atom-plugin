const fs = require('fs')
const path = require('path')
const json5 = require('json5')
const readFile = (filename) => new Promise((resolve, reject) => {
  fs.readFile(filename, (err, buffer) => {
    if (err) {
      return reject(err)
    }
    resolve(buffer)
  })
})
const findTsConfig = async (dirname) => {
  try {
    const filename = path.join(dirname, 'tsconfig.json')
    return [filename, await readFile(filename)]
  } catch (err) {
    const parentDirname = path.join(dirname, '..')
    if (parentDirname !== dirname) {
      return await findTsConfig(parentDirname)
    }
    return Promise.reject(err)
  }
}
const findJsScriptPath = async (scriptPath) => {
  const [tsconfPath, buffer] = await findTsConfig(scriptPath)
  const { outDir, rootDir } = json5.parse(buffer.toString()).compilerOptions
  const jsScriptPath = scriptPath.replace(
    path.join(tsconfPath, '..', rootDir),
    path.join(tsconfPath, '..', outDir)
  ).replace(/\.ts$/, '.js')
  return jsScriptPath
}
module.exports = findJsScriptPath
