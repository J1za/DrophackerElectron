// Packages
import { BrowserWindow, app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import isDev from 'electron-is-dev';
import { createServer } from 'http';
import log from 'electron-log/main';
import { parse } from 'url';
import next from 'next';

log.transports.file.level = "debug"
autoUpdater.logger = log;

log.initialize({ preload: true });
// @ts-ignore
let updateInterval = null;
let updateCheck = false;

app.on('ready', async () => {

  const nextApp = next({
    dev: isDev,
    dir: app.getAppPath() + '/renderer'
  });
  const handle = nextApp.getRequestHandler();
  const port = 3000;

  await nextApp.prepare();

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)

    } catch (err) {
      log.info('Error occurred handling', err);
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      log.info('Error', err);
    })
    .listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`)
    })

  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 650,
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }
  await mainWindow.loadURL(`http://localhost:${port}`);

  autoUpdater.checkForUpdatesAndNotify();
  updateInterval = setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 600000);
});

autoUpdater.on("update-available", (_event) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: `Update Available`,
    detail: `A new version download started`
  } as any;

  if (!updateCheck) {
    updateInterval = null;
    dialog.showMessageBox(dialogOpts);
    autoUpdater.quitAndInstall();
    updateCheck = true;
  }
});

autoUpdater.on("update-downloaded", (_event) => {
  const dialogOpts = {
    type: "question",
    buttons: ["Install and Restart", "Later"],
    defaultId: 0,
    message: "A new update has been downloaded. Would you like to install and restart the app now?"
  } as any;
  dialog.showMessageBox(dialogOpts).then(selection => {
    if (selection.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });;
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
app.on('window-all-closed', app.quit)