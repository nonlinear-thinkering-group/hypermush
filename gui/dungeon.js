const fs = require('fs')
const datn = require('dat-node')
const model = require('./model')
const ev = require('./events')

let hostdat

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
        hostdat = dat
        dat.joinNetwork()

        let progress = dat.importFiles()

        console.log('My Dungeon link is: dat://', dat.key.toString('hex'))
    })
}
ev.on("load", host)

function reload_files(){
    let progress = hostdat.importFiles()
}
ev.on("bag/dropped", reload_files)

module.exports = {
    load_dungeon: load_dungeon,
    host: host,
}
