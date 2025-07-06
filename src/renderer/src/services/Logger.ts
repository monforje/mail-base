// src/renderer/src/services/Logger.ts
export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;

    const electron = (window as any).electron;
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.send("logger-message", logEntry);
    }

    console.log(logEntry);
  }

  public info(message: string): void {
    this.log(`INFO: ${message}`);
  }

  public warning(message: string): void {
    this.log(`WARNING: ${message}`);
  }

  public error(message: string): void {
    this.log(`ERROR: ${message}`);
  }

  public debug(message: string): void {
    this.log(`DEBUG: ${message}`);
  }
}

export const logger = Logger.getInstance();
