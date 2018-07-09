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

function focusWindow(){
    if(mainWindow === null){
        createWindow()
    } else {
        mainWindow.focus()
    }
}

app.on('ready', ()=>{
    createWindow()
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
