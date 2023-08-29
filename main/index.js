"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Packages
/* tslint:disable-next-line */
// Native
const path_1 = require("path");
// Packages
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const electron_updater_1 = require("electron-updater");
// @ts-ignore
let updateInterval = null;
let updateCheck = false;
let updateNotAvailable = false;
const nextApp = (0, next_1.default)({ dev: electron_is_dev_1.default, dir: electron_1.app.getAppPath() + '/renderer' });
const handle = nextApp.getRequestHandler();
// Prepare the renderer once the app is ready
electron_1.app.on('ready', async () => {
    await nextApp.prepare();
    const port = 3000;
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
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
    });
    mainWindow.setMenu(null);
    await mainWindow.loadURL(`http://localhost:${port}`);
    electron_updater_1.autoUpdater.checkForUpdates();
});
// Quit the app once all windows are closed
electron_1.app.on('window-all-closed', electron_1.app.quit);
electron_updater_1.autoUpdater.on("update-available", (_event) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: `Update Available`,
        detail: `A new version should download started or check telegram channel`
    };
    if (!updateCheck) {
        updateInterval = null;
        electron_1.dialog.showMessageBox(dialogOpts);
        electron_updater_1.autoUpdater.quitAndInstall();
        updateCheck = true;
    }
});
electron_updater_1.autoUpdater.on("update-downloaded", (_event) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Application Update",
        detail: "A new version has been downloaded. Restart the application to apply the updates."
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0)
            electron_updater_1.autoUpdater.quitAndInstall();
    });
});
electron_updater_1.autoUpdater.on('download-progress', (progressObj) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Ok"],
        title: 'Download speed: ' + progressObj.bytesPerSecond,
        detail: 'Downloaded ' + progressObj.percent + '%'
    };
    electron_1.dialog.showMessageBox(dialogOpts);
});
electron_updater_1.autoUpdater.on("update-not-available", (_event) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: `Update Not available`,
        message: "A message!",
        detail: `Update Not available`
    };
    if (!updateNotAvailable) {
        updateNotAvailable = true;
        electron_1.dialog.showMessageBox(dialogOpts);
    }
});
