// src/renderer/src/components/UsersSection/UsersSection.tsx
import React, { useState } from "react";
import UsersTable from "./UsersTable";
import HashTableView from "./HashTableView";
import UserModal from "./UserModal";
import { User, ViewMode } from "../../types";
import { usersService } from "../../DataServices";
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

  // ДОБАВЛЕНО: Получение статистики хеш-таблицы
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

    // ДОБАВЛЕНО: Проверка инициализации для операций добавления/удаления/поиска
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

  // ИЗМЕНЕНО: Форматированный заголовок с информацией о хеш-таблице
  const getSectionTitle = () => {
    const info = getHashTableInfo();

    if (!info.isInitialized) {
      if (viewMode === "structure") {
        return "Пользователи (Хеш-таблица: не инициализирована)";
      } else {
        return `Пользователи`;
      }
    }

    if (viewMode === "structure") {
      return `Пользователи (Хеш-таблица: размер ${info.capacity}, загрузка ${(
        info.loadFactor * 100
      ).toFixed(1)}%)`;
    } else {
      return `Пользователи`;
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
        <div className="table-container">
          {viewMode === "table" ? (
            <UsersTable users={users} />
          ) : (
            <HashTableView users={users} />
          )}
        </div>
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
