const database = require('./database')
const bag = require('./bag')
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
    dungeon_key: "",
}

//sync events
ev.on('dat/load-space', (key) => {
    console.log(key)
    model.my_key = key
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
    model.messages = messages.sort((a,b)=>{
        return new Date(a.date) - new Date(b.date)
    })
    console.log(messages)
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

ev.on('controller/move', (dir)=> {
    let newpos = [model.position[0]+dir[0], model.position[1]+dir[1]]
    if(model.map[newpos[0]+10] && model.map[newpos[0]+10][newpos[1]+10]){
        ev.emit("model/beforemoved")

        model.position = newpos
        model.dungeon_key = model.mapobj[model.position[0]][model.position[1]]
        ev.emit("model/moved")
        //dungeon.load_dungeon(model.dungeon_key, (file)=>{
        //    model.dungeon = file
        //    database.getMessages(model.dungeon_key)
        //    database.getDropped(model.dungeon_key)
        //    controller.message("_enters the room_", model.dungeon_key)
        //    m.redraw()
        //})
    }
})

module.exports = model
