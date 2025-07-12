import { usersService, packagesService } from "./DataServices";
import AboutModal from "./components/AboutModal";
import HashTableSizeModal from "./components/HashTableSizeModal";
import MenuStrip from "./components/MenuStrip";
import PackagesSection from "./components/PackagesSection/PackagesSection";
import UsersSection from "./components/UsersSection/UsersSection";
import { AppHandlers } from "./handlers/AppHandlers";
import { User, Package, ViewMode } from "./types";
import React, { useState, useEffect } from "react";
import "./assets/App.css";
import "./assets/SectionHeader.css";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [isHashTableSizeModalOpen, setIsHashTableSizeModalOpen] =
    useState(false);
  const [hashTableUserCount, setHashTableUserCount] = useState(0);
  const [hashTableSizeResolver, setHashTableSizeResolver] = useState<{
    resolve: (size: number) => void;
    reject: () => void;
  } | null>(null);

  const handlers = new AppHandlers(
    setUsers,
    setPackages,
    setIsAboutModalOpen,
    setViewMode
  );

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

  const refreshData = () => {
    setUsers(usersService.getAllUsers());
    setPackages(packagesService.getAllPackages());
  };

  const handleDataChange = () => {
    refreshData();
  };

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
