    const fs = require('fs')
const hyperdb = require('hyperdb')
const discovery = require('hyperdiscovery')
const ev = require('./events')
const crypt = require("cryptiles");

var db, swarm
var key, lkey
var messagewatcher, droppedwatcher

function create(name) {
    db = hyperdb('./dat/'+name, {valueEncoding: 'utf-8'})
    db.put('/space', name, function (err) {
        if (err) throw err
    })
    connect(db)
}
ev.on("controller/host", create)

function listen(key) {
    db = hyperdb('./dat/'+key, key, {valueEncoding: 'utf-8'})
    connect(db)
}
ev.on("controller/join", listen)

function connect(db){
    db.on('ready', ()=>{
        key = db.key.toString('hex')
        lkey = db.local.key.toString('hex')
        ev.emit('dat/load-space', lkey)

        //pass values for auto authorize
        swarm = discovery(db, {
            stream: function (peer) {
                return db.replicate({
                    live: true, upload: true, download: true,
                    userData: JSON.stringify({
                        key: db.local.key
                    })
                })
            }
        })

        swarm.on('connection', (peer, type)=>{
            console.log("new connection: "+peer.key.toString('hex'))
            peer.on('close', ()=>{
                console.log("closed connection: "+peer.key.toString('hex'))
            })
            authorize(peer)
        })

        //register dungeon
        registerDungeon()

        //broadcast the map
        getMap()
        db.watch('/map', function () {
            getMap()
        })

        getNames()
        db.watch('/names', function () {
            getNames()
        })
    })
}

function authorize(peer){
    //auto authorize
    if (peer.remoteUserData !== undefined){
        let data
        try { data = JSON.parse(peer.remoteUserData) } catch (err) { return console.log(err)}
        if(data){
            let key = Buffer.from(data.key)
            let username = data.username
            db.authorized(key, function (err, auth) {
                if (err) return console.log(err)
                if (!auth) {
                    db.authorize(key, function (err) {
                        if (err) return console.log(err)
                    })
                }
            })
        }
    }
}


function getNames(){
    if(db){
        db.list('/names/', (err, l)=>{
            var names = l.map((node)=>{
                return [
                    node[0].key.split("/")[1], node[0].value
                ]
            })
            ev.emit('dat/names', names)
        })
    }
}

function setName(name){
    db.put('/names/'+lkey, name, (err)=>{
        if (err) throw err
        getNames()
    })
}
ev.on("controller/name", setName)


function setAuth(key){
    console.log(key)
    db.authorize(Buffer.from(key, 'hex'), (err)=>{
        if (err) throw err
    })
}

function watchMessages(){
    if(model.dungeon_key && db){
        let path = '/messages/'+model.dungeon_key
        getMessages(path)
        if(messagewatcher) {messagewatcher.destroy()}
        messagewatcher = db.watch(path, ()=>{
            getMessages(path)
        })
    }
}


function getMessages(path){
    console.log('change')
    db.list(path, (err, l)=>{
        var messages = l.map((node)=>{
            return JSON.parse(node[0].value)
        })
        ev.emit('dat/messages', messages)
    })
}

function message(message){
    let path = '/messages/'+model.dungeon_key
    var k = crypt.randomString(64)
    db.put(path+'/'+k, JSON.stringify(message), (err)=>{
        if (err) throw err
    })
}
ev.on("controller/message", message)

function drop(file) {
    let path = '/drop/'+model.dungeon_key
    db.put(path+'/'+file, JSON.stringify({
        file: file,
        key: model.dungeon_key
    }), (err) => {
        if (err) throw err
    })
}
ev.on("bag/dropped", drop)

function pick(file) {
    console.log("picked")
    let path = '/drop/'+model.dungeon_key
    db.del(path+'/'+file, (err) => {
        if (err) throw err
    })
}
ev.on("bag/picked", pick)


function watchDropped(){
    console.log(model.dungeon_key)
    if(model.dungeon_key && db){
        let path = '/drop/'+model.dungeon_key+'/'
        getDropped(path)
        if(droppedwatcher) {droppedwatcher.destroy()}
        droppedwatcher = db.watch(path, ()=>{
            getDropped(path)
        })
    }
}

function getDropped(path){
  if(db){
    db.list(path, (err, l)=>{
      var dropped = l.map((node)=>{
        return JSON.parse(node[0].value)
      })
      ev.emit('dat/dropped', dropped)
    })
  }
}

function getMap(){
    if(db){
        let map = {}
        db.list('/map/', (err, l)=>{
            l.map((node)=>{
                let coords = node[0].key.split("/")
                let x = coords[1]
                let y = coords[2]
                if(map[x] === undefined) map[x] = {}
                map[x][y] = node[0].value
            })
            ev.emit('dat/map', map)
        })
    }
}

function registerDungeon(){
    const dungeonDat = require("../files/dat.json")
    let url = dungeonDat.url.substring(6)
    //find empty spot
    let map = {}
    let registered = false
    db.list('/map/', (err, l)=>{
        //load map

        l.map((node)=>{
            let coords = node[0].key.split("/")
            let x = coords[1]
            let y = coords[2]
            if(map[x] === undefined) map[x] = {}
            map[x][y] = node[0].value
            if(node[0].value === url){
                registered = true;
            }
        })

        if(!registered){
            //find an empty spot
            let x = 0;
            let y = 0;

            if(Object.keys(map).length > 0) {
                let emptyspots = []
                Object.keys(map).map((kx)=>{
                    Object.keys(map[kx]).map((ky)=>{
                        let ix = parseInt(kx)
                        let iy = parseInt(ky)


                        if(map[ix-1] === undefined || map[ix-1][iy] === undefined){ emptyspots.push([ix-1,iy]) }
                        if(map[ix+1] === undefined || map[ix+1][iy] === undefined){ emptyspots.push([ix+1,iy]) }
                        if(map[ix] === undefined || map[ix][iy+1] === undefined){ emptyspots.push([ix,iy+1]) }
                        if(map[ix] === undefined || map[ix][iy-1] === undefined){ emptyspots.push([ix,iy-1]) }
                    })
                })
                let pick = Math.floor(Math.random()*emptyspots.length)
                x = emptyspots[pick][0]
                y = emptyspots[pick][1]
            }

            //store in empty spot
            db.put('/map/'+x+'/'+y, url, (err) => {
                if (err) throw err
            })
        }

    })
}

ev.on("model/moved", ()=>{
    watchMessages()
    watchDropped()
})
