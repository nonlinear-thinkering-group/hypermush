const fs = require('fs')
const datn = require('dat-node')

function dungeon (cb) {
  datn('./files/dungeon/downloads/' + model.dungeon_key, { key: model.dungeon_key }, function (err, dat) {
    if (err) throw err
    dat.joinNetwork()

    dat.archive.readFile('/dungeon.md', function (err, file) => {
      cb(file)
    })
  })

}

module.exports = { descr: dungeon }

