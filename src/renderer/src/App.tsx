import { usersService, packagesService } from "./DataServices";
import AboutModal from "./components/AboutModal";
import HashTableSizeModal from "./components/HashTableSizeModal";
import MenuStrip from "./components/MenuStrip";
import PackagesSection from "./components/PackagesSection/PackagesSection";
import UsersSection from "./components/UsersSection/UsersSection";
import ReportsSection from "./components/ReportsSection/ReportsSection";
import ReportsTreeView from "./components/ReportsSection/ReportsTreeView";
import { AppHandlers } from "./handlers/AppHandlers";
import { User, Package, ViewMode } from "./types";
import React, { useState, useEffect } from "react";
import "./assets/App.css";
import "./assets/SectionHeader.css";
import { ReportData } from "./data-structures/ReportsArray";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentView, setCurrentView] = useState<"main" | "reports" | "reportsTree">("main");

  const [isHashTableSizeModalOpen, setIsHashTableSizeModalOpen] =
    useState(false);
  const [hashTableUserCount, setHashTableUserCount] = useState(0);
  const [hashTableSizeResolver, setHashTableSizeResolver] = useState<{
    resolve: (size: number) => void;
    reject: () => void;
  } | null>(null);

  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [reportStatistics, setReportStatistics] = useState<{
    totalReports: number;
    uniqueDates: number;
    totalWeight: number;
    averageWeight: number;
  } | null>(null);
  const [reportIsLoading, setReportIsLoading] = useState(false);

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
      "Состояние приложения — Пользователей:",
      users.length,
      "Посылок:",
      packages.length
    );
    console.log(
      "Состояние сервисов — Пользователей:",
      usersService.getCount(),
      "Посылок:",
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

  const handleReportsOpen = () => {
    setCurrentView("reports");
    console.log("Переключено на просмотр отчетов");
  };

  const handleReportsTreeOpen = () => {
    setCurrentView("reportsTree");
    console.log("Переключено на просмотр дерева отчетов");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    console.log("Переключено на основной вид");
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
        if (currentView === "reports" || currentView === "reportsTree") {
          handleBackToMain();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAboutModalOpen, isHashTableSizeModalOpen, currentView]);

  const renderMainView = () => (
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
  );

  const renderReportsView = () => (
    <div className="content-area">
      <ReportsSection
        users={users}
        packages={packages}
        reportData={reportData}
        setReportData={setReportData}
        reportStatistics={reportStatistics}
        setReportStatistics={setReportStatistics}
        reportIsLoading={reportIsLoading}
        setReportIsLoading={setReportIsLoading}
      />
    </div>
  );

  const renderReportsTreeView = () => (
    <div className="content-area">
      <ReportsTreeView users={users} packages={packages} />
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "reports":
        return renderReportsView();
      case "reportsTree":
        return renderReportsTreeView();
      default:
        return renderMainView();
    }
  };

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
        onReportsOpen={handleReportsOpen}
        onReportsTreeOpen={handleReportsTreeOpen}
        onMainView={handleBackToMain}
      />
      
      {renderCurrentView()}

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