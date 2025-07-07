// src/renderer/src/components/UsersSection/UsersSection.tsx
import React from "react";
import UsersTable from "./UsersTable";
import HashTableView from "./HashTableView";
import { User, ViewMode } from "../../types";
import "../../assets/UsersSectionStyles/UsersSection.css";

interface UsersSectionProps {
  users: User[];
  viewMode: ViewMode;
}

const UsersSection: React.FC<UsersSectionProps> = ({ users, viewMode }) => {
  return (
    <div className="table-section">
      <div className="section-header">
        Пользователи {viewMode === "structure" && "(Хеш-таблица)"}
      </div>
      <div className="table-container">
        {viewMode === "table" ? (
          <UsersTable users={users} />
        ) : (
          <HashTableView users={users} />
        )}
      </div>
    </div>
  );
};

export default UsersSection;
