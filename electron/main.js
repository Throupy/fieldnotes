import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1800,
		height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
	});

    Menu.setApplicationMenu(null);
    win.webContents.openDevTools();
	win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
	createWindow();

    app.on('activate', () => {
        // Apparently MacOS apps will run if no windows are open. Handle this.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(); 
        }
    })
})

// Quit the application when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})