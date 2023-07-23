const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const logFilePath = path.join(app.getPath('appData'), 'app.log');

function writeToLogFile(logMessage) {
  try {
    // Open the log file in append mode
    const fileDescriptor = fs.openSync(logFilePath, 'a');
    
    // Append the log message to the log file
    fs.appendFileSync(fileDescriptor, `${logMessage}\n`);

    // Close the log file
    fs.closeSync(fileDescriptor);
  } catch (error) {
    console.error('Error writing to log file:', error.message);
  }
}

const createWindow = () => {
  console.log('app.getAppPath', app.getPath('logs'));

  const command = '"C:\\Program Files\\WindowsApps\\Monotype.MonotypeFonts_7.0.0.0_x64__nva2cyqsrvg00\\.Components\\Helper\\Updater\\MonotypeFontsUpdater.exe"';
  const args = [ '--checkUpdate' ];
  const child = spawn(command, args, { detached: true, shell: true, });

  child.on('error', (err) => {
    console.log('error', err);
    writeToLogFile("Error " + err.message);
  })

  child.on('close', (code) => { 
    console.log('close', code);
    writeToLogFile("Close " + code);
  })

  child.on('exit', (code) => {  
    writeToLogFile("Exit " + code);
    console.log('exit', code);
  })

  exec(`${command} ${args.join(' ')}`, (err, stdout, stderr) => {
    if (err || stderr) {
      console.log('err', err);
      const errorMessage = err ? err.message : stderr;
      writeToLogFile("Error " + errorMessage);
    }

    console.log('stdout ', stdout);
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
