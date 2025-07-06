// src/renderer/src/components/LoggerWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import "../assets/LoggerConsole.css";

const LoggerWindow: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Загружаем существующие логи при открытии окна
    const loadExistingLogs = async () => {
      try {
        const electron = (window as any).electron;
        if (electron?.ipcRenderer) {
          const existingLogs = await electron.ipcRenderer.invoke(
            "logger-get-logs"
          );
          if (
            existingLogs &&
            Array.isArray(existingLogs) &&
            existingLogs.length > 0
          ) {
            setLogs(existingLogs);
          }
        }
      } catch (error) {
        console.error("Failed to load existing logs:", error);
      }
    };

    loadExistingLogs();

    // Слушаем обновления логов
    const handleLoggerUpdate = (...args: any[]) => {
      if (args.length >= 2 && Array.isArray(args[1])) {
        setLogs([...args[1]]);
      }
    };

    const electron = (window as any).electron;
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.on("logger-update", handleLoggerUpdate);
    }

    return () => {
      const electron = (window as any).electron;
      if (electron?.ipcRenderer) {
        electron.ipcRenderer.removeAllListeners("logger-update");
      }
    };
  }, []);

  useEffect(() => {
    // Автоматически прокручиваем к последнему сообщению
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleClear = () => {
    const electron = (window as any).electron;
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.send("logger-clear");
    }
  };

  const getLogEntryClass = (log: string): string => {
    if (log.includes("Error") || log.includes("failed")) return "error";
    if (log.includes("Warning") || log.includes("Cleared")) return "warning";
    if (log.includes("Statistics") || log.includes("Stats")) return "debug";
    return "info";
  };

  return (
    <div className="console-container">
      <div className="console-content">
        <div className="console-header">
          <div className="console-title">Data Structures Debug Console</div>
          <button className="console-clear-btn" onClick={handleClear}>
            [CLEAR]
          </button>
        </div>

        <div className="console-logs">
          {logs.length === 0 ? (
            <div className="console-empty-message">
              System ready. Waiting for data structure operations...
              <div className="console-cursor"></div>
            </div>
          ) : (
            <>
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`console-log-entry ${getLogEntryClass(log)}`}
                >
                  {log}
                </div>
              ))}
              <div className="console-cursor"></div>
            </>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LoggerWindow;
