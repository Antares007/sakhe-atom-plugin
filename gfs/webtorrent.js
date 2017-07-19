global.WEBTORRENT_ANNOUNCE = require('create-torrent').announceList
  .map((arr) => arr[0])
  .filter((url) => url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0)
  .filter((url) => !url.endsWith('.nz'))
const http$ = require('./http$')
const Torrent = require('webtorrent/lib/torrent')
const createTorrent = require('create-torrent')
const parseTorrent = require('parse-torrent')
const pathJoin = require('path').join
const fs = require('fs')
const ed = require('supercop.js')

const getKeys = () => {
  var keys
  try {
    keys = require('./keys.json')
    return {
      publicKey: new Buffer(keys.publicKey, 'base64'),
      secretKey: new Buffer(keys.secretKey, 'base64')
    }
  } catch (err) {
    keys = ed.createKeyPair(ed.createSeed())
    fs.writeFileSync(require('path').join(__dirname, 'keys.json'), JSON.stringify({
      publicKey: keys.publicKey.toString('base64'),
      secretKey: keys.secretKey.toString('base64')
    }))
    return keys
  }
}

const keypair = getKeys()
const nodeId = require('crypto').createHash('sha1').update(keypair.publicKey).digest()
console.log('nodeId:', nodeId.toString('hex'))
const WebTorrent = require('webtorrent')
const client = new WebTorrent({
  dht: {
    nodeId,
    // bootstrap: [ '192.168.100.5:57599' ],
    verify: ed.verify
  }
})

module.exports = {
  ed,
  keypair,
  client,
  Torrent,
  seed,
  makeTorrent
}
const path = require('path')
const {exec} = require('child_process')
const readFile = (path, options = {}) => new Promise((resolve, reject) => {
  fs.readFile(path, options, (err, data) => {
    if (err) return reject(err)
    resolve(data)
  })
})
const runcmd = (command, args, options = {}) => new Promise((resolve, reject) => {
  exec(command + ' ' + args.join(' '), options, (err, stdout, stderr) => {
    if (err) return reject(err)
    if (stderr) return reject(new Error(stderr))
    resolve(stdout)
  })
})

http$(9999)
  .map(([req, res]) => new Promise((resolve, reject) => {
    const buffers = []
    req.on('data', buff => buffers.push(buff))
    req.on('end', () => {
      res.writeHead(200, {})
      res.end()
      resolve(Buffer.concat(buffers).toString())
    })
  })).await()
  .map(
    gitdir => runcmd('git', ['repack', '-d'], {cwd: gitdir})
              .then(() => runcmd('git', ['update-server-info'], {cwd: gitdir}))
              .then(() => Promise.all([
                readFile(path.join(gitdir, '.git', 'info', 'refs'), {encoding: 'utf8'}),
                readFile(path.join(gitdir, '.git', 'HEAD'), {encoding: 'utf8'}),
                readFile(path.join(gitdir, '.git', 'objects', 'info', 'packs'), {encoding: 'utf8'})
              ]))
              .then(([refs, head, packs]) => ({
                refs: refs.split('\n')
                        .filter(s => s.indexOf('\t') > 0)
                        .map(s => s.split('\t'))
                        .map(([sha, ref]) => ({sha, ref})),
                head: head.trim(),
                packs: packs.split('\n').filter(s => s.startsWith('P ')).map(s => s.slice(2))
              }))
  ).await()
  .tap(console.log.bind(console))
  .take(1)
  .drain()

function seed (infoHash, cb) {
  var dirPath = pathJoin(__dirname, 'torrents', infoHash)
  var filePath = dirPath + '.torrent'
  fs.readFile(filePath, function (err, buff) {
    if (err) return cb(err)
    cb(null, new Torrent(buff, client, { path: dirPath }))
  })
}

function makeTorrent (input, cb) {
  const opts = {}
  createTorrent.parseInput(input, opts, function (err, files) {
    if (err) return cb(err)
    var streams = files.map(function (file) {
      return file.getStream
    })
    createTorrent(input, opts, function (err, torrentBuf) {
      if (err) return cb(err)
      var path = pathJoin(__dirname, 'torrents', parseTorrent(torrentBuf).infoHash)
      fs.writeFile(path + '.torrent', torrentBuf, function (err) {
        if (err) return cb(err)
        var torrent = new Torrent(null, client, {path})
        torrent._onTorrentId(torrentBuf)
        torrent.load(streams, function (err) {
          if (err) return cb(err)
          cb(null, torrent, torrentBuf)
        })
      })
    })
  })
}
