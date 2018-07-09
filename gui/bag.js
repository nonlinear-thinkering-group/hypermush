const fs = require('fs')

function bag (cb) {
  fs.readdir('./files/bag/', (err, files) => {
    cb(files)
  })

}

module.exports = { getItem: bag }

