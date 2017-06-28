global.WEBTORRENT_ANNOUNCE = require('create-torrent').announceList
  .map((arr) => arr[0])
  .filter((url) => url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0)
  .filter((url) => !url.endsWith('.nz'))
const WebTorrent = require('webtorrent')
const Torrent = require('webtorrent/lib/torrent')
const createTorrent = require('create-torrent')
const parseTorrent = require('parse-torrent')
const pathJoin = require('path').join
const fs = require('fs')
const ed = require('supercop.js')

const keypair = ed.createKeyPair(ed.createSeed())
const client = new WebTorrent({
  dht: {
    nodeId: require('crypto').createHash('sha1').update(keypair.publicKey).digest(),
    // bootstrap: [ '192.168.100.5:6881' ],
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
