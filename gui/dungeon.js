const fs = require('fs')
const datn = require('dat-node')
const controller = require('./controller')

function dungeon (cb, model) {
  controller.on('move', () => {
    let key = model.dungeon_key.substring(6)
    datn('./map/' + key, { key: key }, function (err, dat) {
      if (err) throw err
      dat.joinNetwork()

      dat.archive.readFile('/dungeon/dungeon.md', function (err, file) {
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
