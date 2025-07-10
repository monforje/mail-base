// src/renderer/src/App.tsx
import React, { useState, useEffect } from "react";
import MenuStrip from "./components/MenuStrip";
import UsersSection from "./components/UsersSection/UsersSection";
import PackagesSection from "./components/PackagesSection/PackagesSection";
import AboutModal from "./components/AboutModal";
import HashTableSizeModal from "./components/HashTableSizeModal";
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

  // Состояние для модального окна выбора размера хеш-таблицы
  const [isHashTableSizeModalOpen, setIsHashTableSizeModalOpen] =
    useState(false);
  const [hashTableUserCount, setHashTableUserCount] = useState(0);
  const [hashTableSizeResolver, setHashTableSizeResolver] = useState<{
    resolve: (size: number) => void;
    reject: () => void;
  } | null>(null);

  // Создаем экземпляр обработчиков
  const handlers = new AppHandlers(
    setUsers,
    setPackages,
    setIsAboutModalOpen,
    setViewMode
  );

  // Устанавливаем callback для выбора размера хеш-таблицы
  useEffect(() => {
    handlers.setHashTableSizeCallback((userCount, onConfirm, onCancel) => {
      setHashTableUserCount(userCount);
      setHashTableSizeResolver({
        resolve: onConfirm,
        reject: onCancel,
      });
      setIsHashTableSizeModalOpen(true);
    });
  }, [handlers]);

  // Обработчики для модального окна размера хеш-таблицы
  const handleHashTableSizeConfirm = (size: number) => {
    if (hashTableSizeResolver) {
      hashTableSizeResolver.resolve(size);
      setHashTableSizeResolver(null);
    }
    setIsHashTableSizeModalOpen(false);
  };

  const handleHashTableSizeCancel = () => {
    if (hashTableSizeResolver) {
      hashTableSizeResolver.reject();
      setHashTableSizeResolver(null);
    }
    setIsHashTableSizeModalOpen(false);
  };

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
      if (event.key === "Escape") {
        if (isAboutModalOpen) {
          setIsAboutModalOpen(false);
        }
        if (isHashTableSizeModalOpen) {
          handleHashTableSizeCancel();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAboutModalOpen, isHashTableSizeModalOpen]);

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

      <HashTableSizeModal
        isOpen={isHashTableSizeModalOpen}
        userCount={hashTableUserCount}
        onClose={handleHashTableSizeCancel}
        onConfirm={handleHashTableSizeConfirm}
      />
    </div>
  );
};

export default App;