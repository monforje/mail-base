import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

const api = {};

const extendedElectronAPI = {
  ...electronAPI,
  ipcRenderer: {
    send: (channel: string, ...args: any[]) =>
      ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    removeAllListeners: (channel: string) =>
      ipcRenderer.removeAllListeners(channel),
    invoke: (channel: string, ...args: any[]) =>
      ipcRenderer.invoke(channel, ...args),
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", extendedElectronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = extendedElectronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
