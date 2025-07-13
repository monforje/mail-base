import { usersService } from "../../DataServices";
import { User, ViewMode } from "../../types";
import HashTableStructureView from "./HashTableStructureView";
import HashTableView from "./HashTableView";
import UserModal from "./UserModal";
import UsersTable from "./UsersTable";
import React, { useState, useEffect } from "react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Добавляем обработку клавиши Escape для выхода из полноэкранного режима
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      // Предотвращаем скролл страницы в полноэкранном режиме
      document.body.classList.add("fullscreen-mode");
    } else {
      document.body.classList.remove("fullscreen-mode");
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("fullscreen-mode");
    };
  }, [isFullscreen]);

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
        viewMode === "datastructure"
      ) {
        return 'Справочник "Пользователи" (Хеш-таблица: не инициализирована)';
      } else {
        return 'Справочник "Пользователи"';
      }
    }

    if (viewMode === "structure") {
      return `Справочник "Пользователи" (Хеш-таблица: размер ${info.capacity}, загрузка ${(info.loadFactor * 100).toFixed(1)}%)`;
    } else if (viewMode === "datastructure") {
      return 'Справочник "Пользователи" (Детальная структура хеш-таблицы)';
    } else {
      return 'Справочник "Пользователи"';
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
      default:
        return <UsersTable users={users} />;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div
        className={`table-section ${isFullscreen ? 'fullscreen' : ''}`}
      >
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
            <button
              className={`action-icon ${isFullscreen ? 'fullscreen-active' : ''}`}
              onClick={toggleFullscreen}
              title={isFullscreen ? "Выйти из полноэкранного режима (Esc)" : "Полноэкранный режим"}
            >
              {isFullscreen ? "🗗" : "⛶"}
            </button>
          </div>
        </div>
        <div className="table-container">
          {renderContent()}
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