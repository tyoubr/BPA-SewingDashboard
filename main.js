const { app, BrowserWindow } = require('electron');

let mainWindow;
const urls = ["https://www.facebook.com", "https://www.youtube.com"];
let currentIndex = 0;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        kiosk: false, // set true for full-screen
        webPreferences: {
            nodeIntegration: false,
        }
    });

    // Load first site
    mainWindow.loadURL(urls[currentIndex]);

    // Switch every 10 seconds
    setInterval(() => {
        currentIndex = 1 - currentIndex;
        mainWindow.loadURL(urls[currentIndex]);
    }, 10000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});