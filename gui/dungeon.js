const fs = require('fs')

function dungeon (cb) {
  fs.readFile('./files/dungeon/dungeon.md', 'UTF-8', (err, file) => {
    cb(file)
  })

}

module.exports = { descr: dungeon }

