// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

let mainWindow: BrowserWindow | null = null;
let loggerWindow: BrowserWindow | null = null;

// Глобальное хранилище логов
let logs: string[] = [];

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function createLoggerWindow(): void {
  if (loggerWindow && !loggerWindow.isDestroyed()) {
    loggerWindow.focus();
    return;
  }

  loggerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    title: "Logger Console",
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  loggerWindow.on("ready-to-show", () => {
    loggerWindow?.show();
    // Отправляем существующие логи в окно логгера
    if (logs.length > 0) {
      loggerWindow?.webContents.send("logger-update", logs);
    }
  });

  loggerWindow.on("closed", () => {
    loggerWindow = null;
  });

  // Load logger page
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    loggerWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/logger.html");
  } else {
    loggerWindow.loadFile(join(__dirname, "../renderer/logger.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC handlers
  ipcMain.on("ping", () => console.log("pong"));

  ipcMain.on("open-logger", () => {
    createLoggerWindow();
  });

  // Обработчик логов
  ipcMain.on("logger-message", (_, message: string) => {
    logs.push(message);

    // Ограничиваем количество логов
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // Отправляем обновление в окно логгера, если оно открыто
    if (loggerWindow && !loggerWindow.isDestroyed()) {
      loggerWindow.webContents.send("logger-update", logs);
    }

    // Также выводим в консоль главного процесса
    console.log(message);
  });

  // Обработчик очистки логов
  ipcMain.on("logger-clear", () => {
    logs = [];
    if (loggerWindow && !loggerWindow.isDestroyed()) {
      loggerWindow.webContents.send("logger-update", logs);
    }
  });

  // Обработчик запроса текущих логов
  ipcMain.handle("logger-get-logs", () => {
    return logs;
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
