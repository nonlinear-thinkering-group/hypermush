const ev = require('./events')

let controller = {
    message: (message, room)=>{
        var write = true;
        if(message.charAt(0)==="/"){
            write = controller.command(message, model.my_key)
        }

        if(write){
            const me = {
                text: message,
                date: new Date(),
                user: model.my_key
            }
            ev.emit("controller/message", me)
        }

    },
    command: (message, key)=>{
        const cmd = message.split(/ (.+)/)
        if(cmd[0]==="/host"){
            ev.emit("controller/host", cmd[1])
            return false
        }

        if(cmd[0]==="/join"){
            ev.emit("controller/join", cmd[1])
            return false
        }

        if(cmd[0]==="/name"){
            ev.emit("controller/name", cmd[1])
            return false
        }

        if(cmd[0]==="/drop"){
            ev.emit("controller/drop", cmd[1])
            return false
        }

        if(cmd[0]==="/pick"){
            ev.emit("controller/pick", cmd[1])
        }

        if(cmd[0]==="/goto"){
            ev.emit("controller/move", cmd[1])
        }
    }
}

ev.on("model/beforemoved", (filename) => controller.message('*leaves the room*'))
ev.on("model/moved", (filename) => controller.message('*enters the room*'))
ev.on("bag/dropped", (filename) => controller.message('*dropped ' + filename + '*', model.dungeon_key))
ev.on("bag/picked", (filename) => controller.message('*picked up ' + filename + '*', model.dungeon_key))
ev.on("bag/notfound", (filename) => controller.message('*tried to pick up ' + filename + " but it was'nt there*", model.dungeon_key))


module.exports = controller
