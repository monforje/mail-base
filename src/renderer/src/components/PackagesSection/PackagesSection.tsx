import { packagesService } from "../../DataServices";
import { Package, ViewMode } from "../../types";
import PackageModal from "./PackageModal";
import PackagesArrayView from "./PackagesArrayView";
import PackagesTable from "./PackagesTable";
import RBTreeStructureView from "./RBTreeStructureView";
import RBTreeView from "./RBTreeView";
import React, { useState } from "react";
import "../../assets/PackagesSectionStyles/PackagesSection.css";
import "../../assets/Modal.css";

interface PackagesSectionProps {
  packages: Package[];
  viewMode: ViewMode;
  onDataChange: () => void;
}

const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  viewMode,
  onDataChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"search" | "add" | "delete">(
    "search"
  );
  const [searchResults, setSearchResults] = useState<Package[] | undefined>(
    undefined
  );

  const handleSearch = (senderPhone: number) => {
    const results = packagesService.findPackagesBySender(senderPhone);
    setSearchResults(results);
  };

  const handleAdd = (pkg: Package) => {
    try {
      packagesService.addPackage(pkg);
      onDataChange();
      alert("Посылка успешно добавлена");
    } catch (error) {
      alert(`Ошибка добавления посылки: ${error}`);
    }
  };

  const handleDelete = (
    senderPhone: number,
    receiverPhone: number,
    date: string
  ) => {
    const success = packagesService.removePackage(
      senderPhone,
      receiverPhone,
      date
    );
    if (success) {
      onDataChange();
      alert("Посылка успешно удалена");
    } else {
      alert("Посылка не найдена");
    }
  };

  const openModal = (mode: "search" | "add" | "delete") => {
    setModalMode(mode);
    setSearchResults(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchResults(undefined);
  };

  const getTreeStats = () => {
    return packagesService.getTreeStatistics();
  };

  const getSectionTitle = () => {
    const stats = getTreeStats();

    if (viewMode === "structure") {
      return `Посылки (Красно-черное дерево: ${stats.uniqueSenders} отправителей)`;
    } else if (viewMode === "datastructure") {
      return `Посылки (Детальная структура красно-черного дерева)`;
    } else if (viewMode === "arrayview") {
      return `Посылки (Массив данных: ${stats.size} элементов)`;
    } else {
      return `Посылки`;
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case "table":
        return <PackagesTable packages={packages} />;
      case "structure":
        return <RBTreeView packages={packages} />;
      case "datastructure":
        return <RBTreeStructureView packages={packages} />;
      case "arrayview":
        return <PackagesArrayView packages={packages} />;
      default:
        return <PackagesTable packages={packages} />;
    }
  };

  return (
    <>
      <div className="table-section">
        <div className="section-header">
          <div className="section-title">{getSectionTitle()}</div>
          <div className="section-actions">
            <button
              className="action-icon"
              onClick={() => openModal("search")}
              title="Найти посылки"
            >
              🔍
            </button>
            <button
              className="action-icon"
              onClick={() => openModal("add")}
              title="Добавить посылку"
            >
              ➕
            </button>
            <button
              className="action-icon"
              onClick={() => openModal("delete")}
              title="Удалить посылку"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="table-container">{renderContent()}</div>
      </div>

      <PackageModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={closeModal}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onDelete={handleDelete}
        searchResults={searchResults}
      />
    </>
  );
};

export default PackagesSection;
