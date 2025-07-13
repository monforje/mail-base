import React, { useState, useEffect, useRef } from "react";
import "../assets/LoggerConsole.css";

const LoggerWindow: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        console.error("Не удалось загрузить существующие логи:", error);
      }
    };

    loadExistingLogs();

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
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    const scrollToBottom = () => {
      const logsContainer = document.querySelector(".console-logs");
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    };

    if (logs.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [logs]);

  const handleClear = () => {
    const electron = (window as any).electron;
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.send("logger-clear");
    }
  };

  const getLogClass = (log: string): string => {
    if (log.includes("ОШИБКА") || log.includes("ошибка")) return "error";
    if (log.includes("ПРЕДУПРЕЖДЕНИЕ") || log.includes("очищен"))
      return "warning";
    if (log.includes("ОТЛАДКА") || log.includes("статистика")) return "debug";
    if (log.includes("добавлен") || log.includes("завершено")) return "success";
    return "info";
  };

  return (
    <div className="console-container">
      <div className="console-header">
        <div className="console-title">
          Консоль логов ({logs.length} записей)
        </div>
        <button className="console-clear-btn" onClick={handleClear}>
          Очистить
        </button>
      </div>

      <div className="console-content">
        <div className="console-logs">
          {logs.length === 0 ? (
            <div className="console-empty-message">Ожидание логов...</div>
          ) : (
            <>
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`console-log-entry ${getLogClass(log)}`}
                >
                  {log}
                </div>
              ))}
              <div style={{ color: "#44ff44", marginTop: "8px" }}>
                $ <div className="console-cursor"></div>
              </div>
            </>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LoggerWindow;
