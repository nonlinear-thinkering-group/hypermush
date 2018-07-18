const fs = require('fs')
const datn = require('dat-node')
const model = require('./model')
const controller = require('./controller')

function dungeon (cb) {
  controller.on('move', () => {
    datn('./map/' + model.dungeon_key, { key: model.dungeon_key }, function (err, dat) {
      if (err) throw err
      dat.joinNetwork()

      dat.archive.readFile('/dungeon/dungeon.md', function (err, file) {
        if (err) throw err
        cb(file)
      })
    })
  })

}

module.exports = { descr: dungeon }

