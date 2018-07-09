const database = require('./database')

module.exports = {
    input: "", //value of input field
    my_key: "", // current key
    messages: [], // all the messages
    names: {}, // maps keys to usernames
    colors: {}, // maps keys to usernames
    online: [], // array of online users
    trades: []
}


//load data
database.getNames()
database.getMessages()
database.getTrades()

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

database.on('trades', (trades) => {
    model.trades = trades
    console.log(trades)
    m.redraw()
})
