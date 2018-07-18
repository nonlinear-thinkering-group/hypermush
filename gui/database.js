const fs = require('fs')
const hyperdb = require('hyperdb')
const discovery = require('hyperdiscovery')

//var discovery = require('discovery-swarm')
//var swarmDefaults = require('dat-swarm-defaults')

const events = require('events');
const crypt = require("cryptiles")

var ev = new events.EventEmitter();

var db, swarm
var key, lkey

function create(name) {
    db = hyperdb('./dat/'+name, {valueEncoding: 'utf-8'})
    db.put('/space', name, function (err) {
        if (err) throw err
    })
    connect(db)
}

function listen(key) {
    db = hyperdb('./dat/'+key, key, {valueEncoding: 'utf-8'})
    connect(db)
}

function connect(db){
    db.on('ready', ()=>{
        key = db.key.toString('hex')
        lkey = db.local.key.toString('hex')

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



            //auto authorize
            if (peer.remoteUserData !== undefined){
                let data
                try { data = JSON.parse(peer.remoteUserData) } catch (err) { return console.log(err)}
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

        })

        //register dungeon
        registerDungeon()

        //broadcast everything
        getKey()
        getNames()
        getMessages()
        getMap()

        //watch changes
        db.watch('/names', function () {
            getNames()
        })

        db.watch('/messages', function () {
            getMessages()
        })

        db.watch('/map', function () {
            getMap()
        })

    })
}

function getKey(){
    if(db){
        ev.emit('load-space', lkey)
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
            ev.emit('names', names)
        })
    }
}

function setName(name){
    db.put('/names/'+lkey, name, (err)=>{
        if (err) throw err
        getNames()
    })
}

function getColors(){
    if(db){
        db.list('/colors/', (err, l)=>{
            var names = l.map((node)=>{
                return [
                    node[0].key.split("/")[1], node[0].value
                ]
            })
            ev.emit('colors', names)
        })
    }
}

function setColor(name){
    db.put('/colors/'+lkey, name, (err)=>{
        if (err) throw err
        getColors()
    })
}

function setAuth(key){
    console.log(key)
    db.authorize(Buffer.from(key, 'hex'), (err)=>{
        if (err) throw err
    })
}

function getMessages(){
    if(db){
        db.list('/messages/', (err, l)=>{
            var messages = l.map((node)=>{
                return JSON.parse(node[0].value)
            })
            ev.emit('messages', messages)
        })
    }
}

function message(message){
    var k = crypt.randomString(64)
    db.put('/messages/'+k, JSON.stringify(message), (err)=>{
        if (err) throw err
        getMessages()
    })
}

function trade(trade) {
    var k = crypt.randomString(64)
    fs.readFile('./files/bag/'+trade, (err, data) => {
        if (err) throw err
        db.put('/trades/'+k, data, (err) => {
            if (err) throw err
            console.log(trade)
            getTrades()
        })
    })
}

function getTrades(){
  if(db){
    db.list('/trades/', (err, l)=>{
      var trades = l.map((node)=>{
        return node[0].value
      })
      ev.emit('trades', trades)
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
            ev.emit('map', map)
        })
    }
}

function registerDungeon(){
    const dungeonDat = require("../files/dat.json")

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
            if(node[0].value === dungeonDat.url){
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
            db.put('/map/'+x+'/'+y, dungeonDat.url, (err) => {
                if (err) throw err
            })
        }

    })

}

function on(tag, callback){
    ev.on(tag, callback)
}

module.exports = {
    create: create,
    listen: listen,
    getKey: getKey,
    getNames: getNames,
    setName: setName,
    getColors: getColors,
    setColor: setColor,
    setAuth: setAuth,
    trade: trade,
    getTrades: getTrades,
    getMessages: getMessages,
    message: message,
    getMap: getMap,
    registerDungeon: registerDungeon,
    on: on
}
