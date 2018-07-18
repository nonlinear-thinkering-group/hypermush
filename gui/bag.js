const fs = require('fs')
const events = require('events')
const ev = new events.EventEmitter()
const database = require('./database')

function bag () {
  fs.readdir('./files/bag/', (err, files) => {
    files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
    ev.emit("load_bag", files)
  })

}

function drop (filename) {
  fs.readdir('./files/bag/', (err, files) => {
    if (files.find( f => f===filename )){
      database.drop(cmd[1], model.dungeon_key)
      fs.rename('./files/bag/' + filename, './files/drop/' + filename)
      bag()
      return false
    }
  })
}

  module.exports = { 
    getItem: bag,
    drop: drop,
    on: (tag, callback) => {
      ev.on(tag, callback)
    }
  }

