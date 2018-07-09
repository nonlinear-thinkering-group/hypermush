var publish_dat;
const database = require('./database')

module.exports = {
    message: (message)=>{
        var write = true;
        if(message.charAt(0)==="/"){
            write = module.exports.command(message, model.my_key)
        }

        if(write){
            const me = {
                text: message,
                date: new Date(),
                user: model.my_key
            }
            database.message(me)
        }

    },
    command: (message, key)=>{
        const cmd = message.split(" ")
        if(cmd[0]==="/host"){
            database.create(cmd[1])
            return false
        }

        if(cmd[0]==="/join"){
            database.listen(cmd[1])
            return false
        }

        if(cmd[0]==="/auth"){
            database.setAuth(cmd[1])
            return false
        }

        if(cmd[0]==="/name"){
            database.setName(cmd[1])
            return false
        }

        if(cmd[0]==="/trade"){
            const filename = cmd[1]
            fs.readdir('./files/bag/', (err, files) => {
                if (files.find((f)=> {
                    return f===filename
                })){
                    database.trade(cmd[1])
                    return false
                }
            })
        }

    },
    //loadlisteners: ()=>{
    //    fs.readFile("./dat/listening.json", "utf8", (err, data)=>{
    //        if(err) throw err
    //        model.listening = JSON.parse(data)
    //        model.listening.map((o)=>{
    //            connection.listen(o)
    //        })
    //    })
    //},
}
