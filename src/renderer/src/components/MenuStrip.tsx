// src/renderer/src/components/MenuStrip.tsx
import React from "react";
import { MenuStripProps } from "../types";
import "../assets/MenuStrip.css";

const MenuStrip: React.FC<MenuStripProps> = ({
  onUsersClear,
  onPackagesClear,
  onUsersSave,
  onPackagesSave,
  onFileLoad,
  onAbout,
  onRefreshData,
}) => {
  const handleUsersFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileLoad(event, "users");
  };

  const handlePackagesFileLoad = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFileLoad(event, "packages");
  };

  const handleOpenLogger = () => {
    // Отправляем сообщение в главный процесс для открытия логгера
    const electron = (window as any).electron;
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.send("open-logger");
    } else {
      console.log("IPC not available");
    }
  };

  return (
    <div className="menu-strip">
      <div className="menu-bar">
        <div className="menu-item">
          <button className="menu-title">Файл</button>
          <div className="dropdown-menu">
            <label className="menu-button">
              Загрузить пользователей
              <input
                type="file"
                accept=".txt"
                onChange={handleUsersFileLoad}
                style={{ display: "none" }}
              />
            </label>
            <label className="menu-button">
              Загрузить посылки
              <input
                type="file"
                accept=".txt"
                onChange={handlePackagesFileLoad}
                style={{ display: "none" }}
              />
            </label>
            <button className="menu-button" onClick={onUsersClear}>
              Удалить пользователей
            </button>
            <button className="menu-button" onClick={onPackagesClear}>
              Удалить посылки
            </button>
            <button className="menu-button" onClick={onUsersSave}>
              Сохранить пользователей
            </button>
            <button className="menu-button" onClick={onPackagesSave}>
              Сохранить посылки
            </button>
          </div>
        </div>
        <div className="menu-item">
          <button className="menu-title">Данные</button>
          <div className="dropdown-menu">
            <button className="menu-button" onClick={onRefreshData}>
              Обновить отображение
            </button>
          </div>
        </div>
        <div className="menu-item">
          <button className="menu-title">Инструменты</button>
          <div className="dropdown-menu">
            <button className="menu-button" onClick={handleOpenLogger}>
              Открыть логгер
            </button>
          </div>
        </div>
        <div className="menu-item">
          <button className="menu-title" onClick={onAbout}>
            О программе
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuStrip;
