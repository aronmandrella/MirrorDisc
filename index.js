const electron = require('electron');
const path = require('path');
const url = require('url');

const app = electron.app;

const ipcMain = electron.ipcMain;


const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

var mainWindow, win2;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        show: false,
        frame: false,
        fullscreenable: false,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'HTML/index_preload.ts')
        },
    });
    // mainWindow.setMenu(null);
    mainWindow.loadFile(path.join(__dirname, 'HTML/index.html'));
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // mainWindow.webContents.openDevTools();
    });
});

//-------------- ZLECENIA Z OKIENKA -------------//

global.sharedObject = {
    modalStorage: ''
}



