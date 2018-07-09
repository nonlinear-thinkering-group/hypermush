var ipc = require('electron').ipcRenderer;

module.exports = {
    input: "", //value of input field
    my_key: "", // current key
    messages: [], // all the messages
    names: {}, // maps keys to usernames
    colors: {}, // maps keys to usernames
    online: [], // array of online users
}

//sync events
ipc.on('load-space', (e, key) => {
    console.log(key)
    model.my_key = key
    m.redraw()
})

ipc.on('names', (e, names) => {
    model.names = _.object(names)
    console.log(names)
    m.redraw()
})

ipc.on('colors', (e, colors) => {
    model.colors = _.object(colors)
    console.log(colors)
    m.redraw()
})


ipc.on('messages', (e, messages) => {
    model.messages = messages.sort((a,b)=>{
        return new Date(a.date) - new Date(b.date)
    })
    console.log(messages)
    m.redraw()
})
