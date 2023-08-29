// Packages
/* tslint:disable-next-line */
// Native
import { join } from 'path'

// Packages
import { BrowserWindow, app, dialog } from 'electron'
import isDev from 'electron-is-dev'

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { autoUpdater } from 'electron-updater'

// @ts-ignore
let updateInterval = null;
let updateCheck = false;
let updateNotAvailable = false;

const nextApp = next({ dev: isDev, dir: app.getAppPath() + '/renderer' });
const handle = nextApp.getRequestHandler();

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await nextApp.prepare();
  const port = 3000;

  createServer((req: any, res: any) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, () => {
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
      preload: join(__dirname, 'preload.js'),
    },
  });

  mainWindow.setMenu(null);
  await mainWindow.loadURL(`http://localhost:${port}`);

  autoUpdater.checkForUpdates();
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

autoUpdater.on("update-available", (_event) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: `Update Available`,
    detail: `A new version should download started or check telegram channel`
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
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    detail: "A new version has been downloaded. Restart the application to apply the updates."
  } as any;
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
});

autoUpdater.on('download-progress', (progressObj) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: 'Download speed: ' + progressObj.bytesPerSecond,
    detail: 'Downloaded ' + progressObj.percent + '%'
  } as any;
  dialog.showMessageBox(dialogOpts);
})

autoUpdater.on("update-not-available", (_event) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: `Update Not available`,
    message: "A message!",
    detail: `Update Not available`
  } as any;

  if (!updateNotAvailable) {
    updateNotAvailable = true;
    dialog.showMessageBox(dialogOpts);
  }
});