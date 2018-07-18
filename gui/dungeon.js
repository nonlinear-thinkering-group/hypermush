const fs = require('fs')
const datn = require('dat-node')
const model = require('./model')
const controller = require('./controller')

function dungeon (cb) {
  controller.on('move', () => {
    datn('./map/downloads/' + model.dungeon_key, { key: model.dungeon_key }, function (err, dat) {
      if (err) throw err
      dat.joinNetwork()

      dat.archive.readFile('/dungeon.md', function (err, file) {
        if (err) throw err
        cb(file)
      })
    })
  })
}

function host(){
    datn('./files/', function(err, dat){
        dat.importFiles()
        dat.joinNetwork()
        console.log('My Dungeon link is: dat://', dat.key.toString('hex'))
    })
}

module.exports = {
    descr: dungeon,
    host: host
}
