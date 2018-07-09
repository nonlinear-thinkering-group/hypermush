var publish_dat;
var ipc = require('electron').ipcRenderer;

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
            ipc.send('message', me)
            //model.messages.here.push(me)
            //ipc.send('message', me)
            //connection.write(JSON.stringify(model.messages.here))
            //module.exports.mergeMessages()
        }

    },
    command: (message, key)=>{
        const cmd = message.split(" ")
        if(cmd[0]==="/host"){
            ipc.send('new-space', cmd[1])
            return false
        }

        if(cmd[0]==="/join"){
            ipc.send('listen-space', cmd[1])
            return false
        }

        if(cmd[0]==="/auth"){
            ipc.send('set-auth', cmd[1])
            return false
        }

        if(cmd[0]==="/name"){
            ipc.send('set-name', cmd[1])
            return false
        }

        if(cmd[0]==="/color"){
            ipc.send('set-color', cmd[1])
            return false
        }

      if(cmd[0]==="/trade"){
        const filename = cmd[1]
        fs.readdir('./files/bag/', (err, files) => {
          if (files.find((f)=> {
            return f===filename
          })){
          ipc.send('set-trade', cmd[1])
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

ipc.send('sync') //attempt to load data
