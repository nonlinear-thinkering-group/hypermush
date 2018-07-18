const fs = require('fs')

function bag (cb) {
  fs.readdir('./files/bag/', (err, files) => {
    files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
    cb(files)
  })

}

module.exports = { getItem: bag }

