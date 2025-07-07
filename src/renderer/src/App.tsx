// src/renderer/src/App.tsx
import React, { useState, useEffect } from "react";
import MenuStrip from "./components/MenuStrip";
import UsersSection from "./components/UsersSection/UsersSection";
import PackagesSection from "./components/PackagesSection/PackagesSection";
import AboutModal from "./components/AboutModal";
import { User, Package, ViewMode } from "./types";
import { usersService, packagesService } from "./DataServices";
import { AppHandlers } from "./handlers/AppHandlers";
import "./assets/App.css";
import "./assets/SectionHeader.css";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Создаем экземпляр обработчиков
  const handlers = new AppHandlers(
    setUsers,
    setPackages,
    setIsAboutModalOpen,
    setViewMode
  );

  // Проверяем состояние данных при монтировании и изменениях
  useEffect(() => {
    console.log(
      "App state - Users:",
      users.length,
      "Packages:",
      packages.length
    );
    console.log(
      "Service state - Users:",
      usersService.getCount(),
      "Packages:",
      packagesService.getCount()
    );
  }, [users, packages]);

  // Обновляем состояние при изменении данных в сервисах
  const refreshData = () => {
    setUsers(usersService.getAllUsers());
    setPackages(packagesService.getAllPackages());
  };

  // Обработчик изменения данных для секций
  const handleDataChange = () => {
    refreshData();
  };

  // Закрытие модального окна по Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isAboutModalOpen) {
        setIsAboutModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAboutModalOpen]);

  return (
    <div className="app">
      <MenuStrip
        onUsersClear={handlers.handleUsersClear}
        onPackagesClear={handlers.handlePackagesClear}
        onUsersSave={handlers.handleUsersSave}
        onPackagesSave={handlers.handlePackagesSave}
        onFileLoad={handlers.handleFileLoad}
        onAbout={handlers.handleAbout}
        onRefreshData={refreshData}
        onViewModeChange={handlers.handleViewModeChange}
        currentViewMode={viewMode}
      />
      <div className="content-area">
        <UsersSection
          users={users}
          viewMode={viewMode}
          onDataChange={handleDataChange}
        />
        <PackagesSection
          packages={packages}
          viewMode={viewMode}
          onDataChange={handleDataChange}
        />
      </div>

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={handlers.handleCloseAbout}
      />
    </div>
  );
};

export default App;
