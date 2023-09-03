"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Packages
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
// @ts-ignore
let updateInterval = null;
// let updateCheck = false;
// let updateFound = false;
// let updateNotAvailable = false;
const nextApp = (0, next_1.default)({ dev: electron_is_dev_1.default, dir: electron_1.app.getAppPath() + '/renderer' });
const handle = nextApp.getRequestHandler();
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
    await nextApp.prepare();
    const port = 3001;
    (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
    const mainWindow = new electron_1.BrowserWindow({
        minWidth: 800,
        minHeight: 650,
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
        },
    });
    mainWindow.setMenu(null);
    // mainWindow.webContents.openDevTools();
    await mainWindow.loadURL(`http://localhost:${port}`);
    // autoUpdater.checkForUpdates();
    // updateInterval = setInterval(() => autoUpdater.checkForUpdates(), 600000);
});
// autoUpdater.on("update-available", (_event) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Ok'],
//     title: `Update Available`,
//     detail: `A new version should download started or check telegram channel`
//   } as any;
//   if (!updateCheck) {
//     updateInterval = null;
//     dialog.showMessageBox(dialogOpts);
//     autoUpdater.quitAndInstall();
//     updateCheck = true;
//   }
// });
// autoUpdater.on("update-downloaded", (_event) => {
//   const dialogOpts = {
//     type: "info",
//     buttons: ["Restart", "Later"],
//     title: "Application Update",
//     detail: "A new version has been downloaded. Restart the application to apply the updates."
//   } as any;
//   dialog.showMessageBox(dialogOpts);
//   if (!updateFound) {
//     updateInterval = null;
//     updateFound = true;
//     setTimeout(() => {
//       autoUpdater.quitAndInstall();
//     }, 3500);
//   }
// });
// autoUpdater.on('download-progress', (progressObj) => {
//   const dialogOpts = {
//     type: "info",
//     buttons: ["Ok"],
//     title: 'Download speed: ' + progressObj.bytesPerSecond,
//     detail: 'Downloaded ' + progressObj.percent + '%'
//   } as any;
//   dialog.showMessageBox(dialogOpts);
// })
// autoUpdater.on("update-not-available", (_event) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Ok'],
//     title: `Update Not available`,
//     message: "A message!",
//     detail: `Update Not available`
//   } as any;
//   if (!updateNotAvailable) {
//     updateNotAvailable = true;
//     dialog.showMessageBox(dialogOpts);
//   }
// });
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
