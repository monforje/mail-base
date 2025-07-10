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

  // ИСПРАВЛЕНО: Обработчик поиска с числовым телефоном
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
      // ИСПРАВЛЕНО: Обработка ошибки дубликата
      alert(`Ошибка добавления пользователя: ${error}`);
    }
  };

  // ИСПРАВЛЕНО: Обработчик удаления с числовым телефоном
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
    setModalMode(mode);
    setSearchResult(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchResult(undefined);
  };

  return (
    <>
      <div className="table-section">
        <div className="section-header">
          <div className="section-title">
            Пользователи {viewMode === "structure" && "(Хеш-таблица)"}
          </div>
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
