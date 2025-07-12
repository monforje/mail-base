import { usersService } from "../../DataServices";
import { User, ViewMode } from "../../types";
import HashTableStructureView from "./HashTableStructureView";
import HashTableView from "./HashTableView";
import UserModal from "./UserModal";
import UsersArrayView from "./UsersArrayView";
import UsersTable from "./UsersTable";
import React, { useState } from "react";
import "../../assets/UsersSectionStyles/UsersSection.css";
import "../../assets/Modal.css";

interface UsersSectionProps {
  users: User[];
  viewMode: ViewMode;
  onDataChange: () => void;
}

const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  viewMode,
  onDataChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"search" | "add" | "delete">(
    "search"
  );
  const [searchResult, setSearchResult] = useState<User | null | undefined>(
    undefined
  );

  const getHashTableInfo = () => {
    const stats = usersService.getStatistics();
    const isInitialized = usersService.isInitialized();
    return {
      size: stats.size,
      capacity: stats.capacity,
      loadFactor: stats.loadFactor,
      isInitialized,
    };
  };

  const handleSearch = (phone: number) => {
    const user = usersService.getUser(phone);
    setSearchResult(user);
  };

  const handleAdd = (user: User) => {
    try {
      usersService.addUser(user);
      onDataChange();
      alert("Пользователь успешно добавлен");
    } catch (error) {
      alert(`Ошибка добавления пользователя: ${error}`);
    }
  };

  const handleDelete = (phone: number) => {
    const success = usersService.removeUser(phone);
    if (success) {
      onDataChange();
      alert("Пользователь успешно удален");
    } else {
      alert("Пользователь не найден");
    }
  };

  const openModal = (mode: "search" | "add" | "delete") => {
    const info = getHashTableInfo();

    if (
      !info.isInitialized &&
      (mode === "add" || mode === "delete" || mode === "search")
    ) {
      alert(
        "Хеш-таблица не инициализирована. Сначала загрузите пользователей из файла."
      );
      return;
    }

    setModalMode(mode);
    setSearchResult(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchResult(undefined);
  };

  const getSectionTitle = () => {
    const info = getHashTableInfo();

    if (!info.isInitialized) {
      if (
        viewMode === "structure" ||
        viewMode === "datastructure" ||
        viewMode === "arrayview"
      ) {
        return "Пользователи (Хеш-таблица: не инициализирована)";
      } else {
        return `Пользователи`;
      }
    }

    if (viewMode === "structure") {
      return `Пользователи (Хеш-таблица: размер ${info.capacity}, загрузка ${(
        info.loadFactor * 100
      ).toFixed(1)}%)`;
    } else if (viewMode === "datastructure") {
      return `Пользователи (Детальная структура хеш-таблицы)`;
    } else if (viewMode === "arrayview") {
      return `Пользователи (Массив данных: ${info.size} элементов)`;
    } else {
      return `Пользователи`;
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case "table":
        return <UsersTable users={users} />;
      case "structure":
        return <HashTableView users={users} />;
      case "datastructure":
        return <HashTableStructureView users={users} />;
      case "arrayview":
        return <UsersArrayView users={users} />;
      default:
        return <UsersTable users={users} />;
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
              title="Найти пользователя"
            >
              🔍
            </button>
            <button
              className="action-icon"
              onClick={() => openModal("add")}
              title="Добавить пользователя"
            >
              ➕
            </button>
            <button
              className="action-icon"
              onClick={() => openModal("delete")}
              title="Удалить пользователя"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="table-container">{renderContent()}</div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={closeModal}
        onSearch={handleSearch}
        onAdd={handleAdd}
        onDelete={handleDelete}
        searchResult={searchResult}
      />
    </>
  );
};

export default UsersSection;
