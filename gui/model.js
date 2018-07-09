const database = require('./database')
const bag = require('./bag')
const dungeon = require('./dungeon')
const controller = require('./controller')

module.exports = {
    input: "", //value of input field
    my_key: "", // current key
    messages: [], // all the messages
    names: {}, // maps keys to usernames
    colors: {}, // maps keys to usernames
    online: [], // array of online users
    trades: [],
    bag: [],
    dungeon: ""
    map: [],
    position: [0,0]
}


//load data
database.getNames()
database.getMessages()
database.getTrades()
bag.getItem((files) => { model.bag = files; m.redraw() })
dungeon.descr((file) => { model.dungeon = file; m.redraw() })
database.getMap()

//sync events
database.on('load-space', (key) => {
    console.log(key)
    model.my_key = key
    m.redraw()
})

database.on('names', (names) => {
    model.names = _.object(names)
    console.log(names)
    m.redraw()
})

database.on('colors', (colors) => {
    model.colors = _.object(colors)
    console.log(colors)
    m.redraw()
})

database.on('messages', (messages) => {
    model.messages = messages.sort((a,b)=>{
        return new Date(a.date) - new Date(b.date)
    })
    console.log(messages)
    m.redraw()
})

database.on('map', (mapobj) => {
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
    console.log(model.map)
    m.redraw()
})

database.on('trades', (trades) => {
    model.trades = trades
    console.log(trades)
    m.redraw()
})

controller.on('move', (dir)=> {
    let newpos = [model.position[0]+dir[0], model.position[1]+dir[1]]
    if(model.map[newpos[0]+10] && model.map[newpos[0]+10][newpos[1]+10]){
        model.position = newpos
    }
})
