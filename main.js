const path = require('path');
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const logFile = path.join(__dirname, 'backend-log.txt');  // Log file location

let mainWindow;
let backendProcess;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Library System',
        width: 1200,
        height: 650,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            webSecurity: false
        },
        icon: path.join(__dirname, 'whlogo.png')
    });

    // Load the frontend from dist folder in packaged mode
    mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
}

function startBackend() {
    console.log('Starting backend server...');
    logToFile('Starting backend server...');  // Log to file

    // Resolve backend path for both development and production
    const backendPath = app.isPackaged 
        ? path.join(process.resourcesPath, 'backend', 'server.js') 
        : path.join(__dirname, 'backend', 'server.js');

    console.log('Backend path: ' + backendPath);
    logToFile(`Backend path: ${backendPath}`);  // Log to file

    if (!fs.existsSync(backendPath)) {
        console.error(`Backend file not found at ${backendPath}`);
        logToFile(`Backend file not found at ${backendPath}`);  // Log to file
    } else {
        console.log('Backend file found.');
        logToFile('Backend file found.');  // Log to file

        // Get the Node executable path
        const nodePath = app.isPackaged 
            ? path.join(process.resourcesPath, 'node')  // Where node should be in packaged app
            : 'node';

        console.log('Using node from: ' + nodePath);
        logToFile(`Using node from: ${nodePath}`);  // Log to file

        // Run backend in the background using spawn
        backendProcess = spawn(nodePath, [backendPath], {
            stdio: ['ignore', 'ignore', 'ignore'],  // We are ignoring the input/output to keep it in the background
            detached: true     // This makes the backend process run in the background
        });

        // Ensure the backend process is properly handled even if it crashes or exits
        backendProcess.unref();

        backendProcess.on('error', (err) => {
            console.error(`Failed to start backend: ${err.message}`);
            logToFile(`Failed to start backend: ${err.message}`);  // Log to file
        });

        backendProcess.on('exit', (code) => {
            console.log(`Backend server exited with code ${code}`);
            logToFile(`Backend server exited with code ${code}`);  // Log to file
        });

        console.log('Backend server started in the background');
        logToFile('Backend server started in the background');  // Log to file
    }
}

function logToFile(message) {
    const timestamp = new Date().toISOString();  // Add timestamp to logs
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
}

app.on('ready', () => {
    startBackend();
    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    if (backendProcess) {
        backendProcess.kill();
    }
});

app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
