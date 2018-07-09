const config = require('./config.json')

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const Menu = electron.Menu
const Notification = electron.Notification
const ipc = electron.ipcMain;

const path = require('path')
const url = require('url')

const database = require('./database')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, tray

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.setMenu(null);
  if(config.debug) mainWindow.webContents.openDevTools()
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'gui/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    electron.shell.openExternal(url);
  });

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function createTray(){
    tray = new Tray('icon.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'quit',
            click: ()=>{
                app.quit()
            }
        },
      ])
    tray.setToolTip('Pask is syncing')
    tray.setContextMenu(contextMenu)

    tray.on('click', ()=>{
        if (mainWindow === null) {
          createWindow()
          setTrayMessage(false)
        }
    })
}

function focusWindow(){
    if(mainWindow === null){
        createWindow()
    } else {
        mainWindow.focus()
    }

}

function setTrayMessage(sw){
    tray.setImage(sw?'icon_message.png':'icon.png')
}

function showNotification(){
    if(config.notifications && !mainWindow || !mainWindow.isFocused()){
        setTrayMessage(true)
        var n = new Notification({
            title: "Pask",
            body: "New messages!"
        })
        n.on('click', ()=>{
            focusWindow()
            setTrayMessage(false)
        })
        n.show()
    }
}

function connectDat(){
    //incoming messages
    ipc.on('new-space', (e, arg) => {
        database.create(arg)
    })

    ipc.on('listen-space', (e, arg) => {
        database.listen(arg)
    })

    ipc.on('set-name', (e, arg) => {
        database.setName(arg)
    })

    ipc.on('set-color', (e, arg) => {
        database.setColor(arg)
    })

    ipc.on('set-auth', (e, arg) => {
        database.setAuth(arg)
    })

    ipc.on('message', (e, arg) => {
        database.message(arg)
    })

    ipc.on('sync', (e, arg) => {
        database.getKey()
        database.getNames()
        database.getColors()
        database.getMessages()
    })

    //messages to renderer
    database.on('load-space', (a)=>{
        if(mainWindow){
            mainWindow.webContents.send('load-space', a)
        }
    })

    database.on('names', (a)=>{
        if(mainWindow){
            mainWindow.webContents.send('names', a)
        }
    })

    database.on('colors', (a)=>{
        if(mainWindow){
            mainWindow.webContents.send('colors', a)
        }
    })

    database.on('messages', (a)=>{
        if(mainWindow){
            mainWindow.webContents.send('messages', a)
        }
        showNotification()
    })
}

app.on('ready', ()=>{
    createWindow()
    createTray()
    connectDat()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
//    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
