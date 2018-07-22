const fs = require('fs')
const datn = require('dat-node')
const model = require('./model')
const ev = require('./events')

function load_dungeon () {
    let key = model.dungeon_key
    console.log(key)
    datn('./map/' + key, { key: key }, function (err, dat) {
        if (err) throw err
        dat.joinNetwork()

        dat.archive.readFile('/dungeon/dungeon.md', 'UTF-8', function (err, file) {
            if (err) throw err
            ev.emit("dungeon/loaded", file)
        })
    })
}
ev.on("model/moved", load_dungeon)

function host(){
    datn('./files/', function(err, dat){
        dat.importFiles()
        dat.joinNetwork()
        console.log('My Dungeon link is: dat://', dat.key.toString('hex'))
    })
}
ev.on("load", host)

module.exports = {
    load_dungeon: load_dungeon,
    host: host,
}
