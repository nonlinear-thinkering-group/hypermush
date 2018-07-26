const database = require('./database')
const controller = require('./controller')
const ev = require('./events');


let model = {
    input: "", //value of input field
    my_key: "", // current key
    messages: [], // all the messages
    names: {}, // maps keys to usernames
    colors: {}, // maps keys to usernames
    online: [], // array of online users
    dropped: [],
    bag: [],
    dungeon: "",
    map: [],
    mapobj: {},
    position: [0,0],
    room: "",
    enterdate: new Date(),
    peopleinroom: []
}

//sync events
ev.on('dat/load-space', (key) => {
    console.log(key)
    model.my_key = key
    model.room = "tavern"
    ev.emit("model/moved")
    m.redraw()
})

ev.on('bag/load', files => {model.bag = files; m.redraw()})

ev.on('dat/names', (names) => {
    model.names = _.object(names)
    m.redraw()
})

ev.on('dat/colors', (colors) => {m.redraw()
    model.colors = _.object(colors)
    console.log(colors)
    m.redraw()
})

ev.on('dat/messages', (messages) => {
    model.messages = messages
        .filter((a)=>{
            return (new Date(a.date) >= model.enterdate)
        })
        .sort((a,b)=>{
            return a.order - b.order
        })
    console.log(messages)
    m.redraw()
})

ev.on('dat/locations', (locations) => {
    model.locations = locations
    model.peopleinroom = model.locations.filter((a)=>{
        return a[1]===model.room
    }).map((a)=>{
        return a[0]
    })
    m.redraw()
})

ev.on('dat/map', (mapobj) => {
    model.mapobj = mapobj
    let pos = [0,0]
    let size = 10
    let xarr = []
    let yarr = []

    for(let i = pos[0]-size; i<pos[0]+size; i++ ){
        xarr.push(i)
    }

    for(let i = pos[1]-size; i<pos[1]+size; i++ ){
        yarr.push(i)
    }

    model.map = xarr.map((x)=>{
        return yarr.map((y)=>{
            if(mapobj[x]){
                if(mapobj[x][y]){
                    return 1
                }
            }
            return 0
        })
    })

    //update dungeon key
    if(mapobj[model.position[0]] && mapobj[model.position[0]][model.position[1]]){
        model.dungeon_key = mapobj[model.position[0]][model.position[1]]
        ev.emit("model/moved")
    }

    m.redraw()
})

ev.on('dungeon/loaded', (file)=>{
    model.dungeon = file
    m.redraw()
})

ev.on('dat/dropped', (dropped) => {
    model.dropped = dropped
    console.log(dropped)
    m.redraw()
})

ev.on('controller/move', (room)=> {
    ev.emit("model/beforemoved")
    model.room = room
    model.enterdate = new Date()
    ev.emit("model/moved")
    m.redraw()
})

module.exports = model
