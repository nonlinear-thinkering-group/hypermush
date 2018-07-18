const fs = require('fs')
const datn = require('dat-node')


function load_dungeon (dungeon_key, callback) {
      let key = model.dungeon_key.substring(6)
      datn('./map/' + key, { key: key }, function (err, dat) {
        if (err) throw err
        dat.joinNetwork()

        dat.archive.readFile('/dungeon/dungeon.md', 'UTF-8', function (err, file) {
          if (err) throw err
          callback(file)
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
    load_dungeon: load_dungeon,
    host: host,
}
