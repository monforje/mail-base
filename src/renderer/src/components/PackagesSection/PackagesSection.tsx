// src/renderer/src/components/PackagesSection/PackagesSection.tsx
import React, { useState } from "react";
import PackagesTable from "./PackagesTable";
import RBTreeView from "./RBTreeView";
import RBTreeStructureView from "./RBTreeStructureView";
import PackagesArrayView from "./PackagesArrayView";
import PackageModal from "./PackageModal";
import { Package, ViewMode } from "../../types";
import { packagesService } from "../../DataServices";
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

  // Обработчик поиска с числовым телефоном
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

  // Обработчик удаления с числовыми телефонами
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

  // Получение статистики дерева
  const getTreeStats = () => {
    return packagesService.getTreeStatistics();
  };

  // Форматированный заголовок с информацией о дереве
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

  // Выбор компонента для отображения
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
