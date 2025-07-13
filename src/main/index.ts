import icon from "../../build/icon.png?asset";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";

let mainWindow: BrowserWindow | null = null;
let loggerWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

let logs: string[] = [];

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

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
    minWidth: 400,
    minHeight: 300,
    show: false,
    autoHideMenuBar: true,
    title: "Logger Console",
    transparent: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    backgroundMaterial: "acrylic",
    icon: icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  loggerWindow.on("ready-to-show", () => {
    loggerWindow?.show();

    loggerWindow?.setOpacity(0.9);

    if (logs.length > 0) {
      loggerWindow?.webContents.send("logger-update", logs);
    }
  });

  loggerWindow.on("closed", () => {
    loggerWindow = null;
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    loggerWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/logger.html");
  } else {
    loggerWindow.loadFile(join(__dirname, "../renderer/logger.html"));
  }
}

function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 350,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: false,
    show: true,
    icon: icon,
    autoHideMenuBar: true,
  });
  splashWindow.setMenuBarVisibility(false);
  splashWindow.loadFile(join(__dirname, "../renderer/splash.html"));
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => console.log("pong"));

  ipcMain.on("open-logger", () => {
    createLoggerWindow();
  });

  ipcMain.on("logger-message", (_, message: string) => {
    logs.push(message);

    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    if (loggerWindow && !loggerWindow.isDestroyed()) {
      loggerWindow.webContents.send("logger-update", logs);
    }
  });

  ipcMain.on("logger-clear", () => {
    logs = [];
    if (loggerWindow && !loggerWindow.isDestroyed()) {
      loggerWindow.webContents.send("logger-update", logs);
    }
  });

  ipcMain.handle("logger-get-logs", () => {
    return logs;
  });

  createSplashWindow();
  setTimeout(() => {
    createWindow();
  }, 1200); // splash минимум 1.2 сек

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
