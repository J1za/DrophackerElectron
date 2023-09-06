"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Packages
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const http_1 = require("http");
const main_1 = __importDefault(require("electron-log/main"));
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
main_1.default.transports.file.level = "debug";
electron_updater_1.autoUpdater.logger = main_1.default;
main_1.default.initialize({ preload: true });
// @ts-ignore
let updateInterval = null;
let updateCheck = false;
electron_1.app.on('ready', async () => {
    const nextApp = (0, next_1.default)({
        dev: electron_is_dev_1.default,
        dir: electron_1.app.getAppPath() + '/renderer'
    });
    const handle = nextApp.getRequestHandler();
    const port = 3000;
    await nextApp.prepare();
    (0, http_1.createServer)(async (req, res) => {
        try {
            const parsedUrl = (0, url_1.parse)(req.url, true);
            handle(req, res, parsedUrl);
        }
        catch (err) {
            main_1.default.info('Error occurred handling', err);
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    })
        .once('error', (err) => {
        console.error(err);
        main_1.default.info('Error', err);
    })
        .listen(port, () => {
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
    if (electron_1.app.isPackaged) {
        mainWindow.setMenu(null);
    }
    await mainWindow.loadURL(`http://localhost:${port}`);
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    updateInterval = setInterval(() => electron_updater_1.autoUpdater.checkForUpdatesAndNotify(), 600000);
});
electron_updater_1.autoUpdater.on("update-available", (_event) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Ok'],
        title: `Update Available`,
        detail: `A new version download started`
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
        type: "question",
        buttons: ["Install and Restart", "Later"],
        defaultId: 0,
        message: "A new update has been downloaded. Would you like to install and restart the app now?"
    };
    electron_1.dialog.showMessageBox(dialogOpts).then(selection => {
        if (selection.response === 0) {
            electron_updater_1.autoUpdater.quitAndInstall();
        }
    });
    ;
});
// autoUpdater.on('download-progress', (progressObj) => {
//   const dialogOpts = {
//     type: "info",
//     buttons: ["Ok"],
//     detail: 'Downloaded ' + progressObj.percent + '%'
//   } as any;
//   // dialog.showMessageBox(dialogOpts);
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
