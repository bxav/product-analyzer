import { join } from 'path';
import { format } from 'url';
import { BrowserWindow, app, ipcMain, IpcMainEvent } from 'electron';
import isDev from 'electron-is-dev';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

import { Logger, ProductAnalyzerBuilder } from '@repo/ai';

const nextApp = next({ dev: isDev, dir: join(__dirname, '../renderer') });
const handle = nextApp.getRequestHandler();

let mainWindow: BrowserWindow | null;

async function createWindow() {
  await nextApp.prepare();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  await new Promise<void>((resolve) => server.listen(8000, () => resolve()));

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message);

  const logger = new (class testLogger implements Logger {
    log(message: string): void {
      console.log(message);
    }

    info(message: string): void {
      console.log(message);
    }

    success(message: string): void {
      console.log(message);
    }

    warn(message: string): void {
      console.log(message);
    }

    error(message: string): void {
      console.log(message);
    }

    startSpinner(message: string): void {
      console.log(message);
    }

    updateSpinner(message: string): void {
      console.log(message);
    }

    stopSpinner(successMessage?: string): void {
      console.log(successMessage);
    }
  })();

  const productAnalyzer = new ProductAnalyzerBuilder(
    {
      tavilyApiKey: '',
    },
    logger,
  ).build();

  productAnalyzer
    .executeProductAnalysis('ChatGPT', 'Ai Assistant', 'thread-id')
    .then((analysis) => {
      console.log(analysis);

      event.sender.send('message', analysis);
    })
    .catch((error) => {
      console.log(error);
    });
});
