import { MenuStripProps } from "../types";
import React from "react";
import "../assets/MenuStrip.css";

const MenuStrip: React.FC<MenuStripProps & { onMainView?: () => void }> = ({
  onUsersClear,
  onPackagesClear,
  onUsersSave,
  onPackagesSave,
  onFileLoad,
  onAbout,
  onRefreshData,
  onViewModeChange,
  currentViewMode,
  onReportsOpen,
  onReportsTreeOpen,
  onMainView,
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
    const electron = (window as any).electron;
    if (electron?.ipcRenderer) {
      electron.ipcRenderer.send("open-logger");
    } else {
      console.log("IPC not available");
    }
  };

  const handleViewModeChange = (
    mode: "table" | "structure" | "datastructure"
  ) => {
    onViewModeChange(mode);
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
          <button className="menu-title">Вид</button>
          <div className="dropdown-menu">
            <button
              className={`menu-button ${
                currentViewMode === "table" ? "active" : ""
              }`}
              onClick={() => {
                handleViewModeChange("table");
                if (onMainView) onMainView();
              }}
            >
              Таблица данных
            </button>
            <button
              className={`menu-button ${
                currentViewMode === "structure" ? "active" : ""
              }`}
              onClick={() => {
                handleViewModeChange("structure");
                if (onMainView) onMainView();
              }}
            >
              Структура данных (простая)
            </button>
            <button
              className={`menu-button ${
                currentViewMode === "datastructure" ? "active" : ""
              }`}
              onClick={() => {
                handleViewModeChange("datastructure");
                if (onMainView) onMainView();
              }}
            >
              Структура данных (детальная)
            </button>
          </div>
        </div>
        <div className="menu-item">
          <button className="menu-title">Отчеты</button>
          <div className="dropdown-menu">
            <button className="menu-button" onClick={onReportsOpen}>
              Отчет по посылкам
            </button>
            <button className="menu-button" onClick={onReportsTreeOpen}>
              Отчет-Дерево
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
