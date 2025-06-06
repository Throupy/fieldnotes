import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { ipcMain } from 'electron';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

async function waitForVite(url, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            await new Promise((resolve, reject) => {
                const req = http.get(url, res => {
                    res.statusCode === 200 ? resolve() : reject();
                });
                req.on('error', reject);
            });
            return;
        } catch {
            await new Promise(r => setTimeout(r, 100));
        }
    }
    throw new Error('Vite dev server did not respond in time.');
}

ipcMain.handle('auth:ping', async (event, authUrl) => {
    return new Promise((resolve) => {
      try {
        const { hostname, port, pathname, protocol } = new URL(authUrl);
        const client = protocol === 'https:' ? https : http;

        console.log("pinging", protocol, hostname, port, pathname)

        const req = client.request(
          {
            method: 'HEAD',
            host: hostname,
            port: port || (protocol === 'https:' ? 443 : 80),
            path: "/ping",
            timeout: 3000,
          },
          res => resolve(res.statusCode === 200)
        );
  
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
  
        req.end();
      } catch (err) {
        console.error('Invalid authUrl or request failed:', err);
        resolve(false);
      }
    });
  });


const createWindow = async () => {
	const win = new BrowserWindow({
		width: 1800,
		height: 900,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
	});

    Menu.setApplicationMenu(null);

    const devServerURL = 'http://localhost:5173';
    try {
        await waitForVite(devServerURL);
        await win.loadURL(devServerURL);
        win.show();
        win.webContents.openDevTools();
    } catch (err) {
        console.error('Failed to connect to Vite:', err);
    }
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