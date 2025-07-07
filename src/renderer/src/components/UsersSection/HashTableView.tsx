// src/renderer/src/components/UsersSection/HashTableView.tsx
import React from "react";
import { User } from "../../types";

interface HashTableViewProps {
  users: User[];
}

const HashTableView: React.FC<HashTableViewProps> = ({ users }) => {
  return (
    <div className="hashtable-view">
      {/* Пустой блок для будущей реализации визуализации хеш-таблицы */}
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        Визуализация хеш-таблицы пользователей
        <br />
        (в разработке)
        <br />
        Пользователей: {users.length}
      </div>
    </div>
  );
};

export default HashTableView;
