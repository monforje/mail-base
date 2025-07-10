// src/renderer/src/components/UsersSection/HashTableView.tsx
import React from "react";
import { User } from "../../types";
import { usersService } from "../../DataServices";
import "../../assets/UsersSectionStyles/HashTableView.css";

interface HashTableViewProps {
  users: User[];
}

interface HashTableEntry {
  index: number;
  key: string;
  value: User | null;
  status: "empty" | "occupied" | "deleted";
  hashValue?: number;
}

const HashTableView: React.FC<HashTableViewProps> = ({}) => {
  // ИСПРАВЛЕНО: Получаем доступ к внутренней структуре хеш-таблицы через публичный метод
  const getHashTableStructure = (): HashTableEntry[] => {
    return usersService.getHashTableEntries();
  };

  const hashTableEntries = getHashTableStructure();

  const getStatusText = (status: string): string => {
    switch (status) {
      case "empty":
        return "Пусто";
      case "occupied":
        return "Занято";
      case "deleted":
        return "Удалено";
      default:
        return "—";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "empty":
        return "#f0f0f0";
      case "occupied":
        return "#e8f5e8";
      case "deleted":
        return "#ffebee";
      default:
        return "#ffffff";
    }
  };

  return (
    <div className="hashtable-structure">
      <div
        style={{
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          fontSize: "12px",
        }}
      ></div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Индекс</th>
            <th>Ключ (Телефон)</th>
            <th>Значение (ФИО + Адрес)</th>
            <th>Хеш</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {hashTableEntries.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-message">
                Хеш-таблица пуста
              </td>
            </tr>
          ) : (
            hashTableEntries.map((entry, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: getStatusColor(entry.status),
                }}
              >
                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                  {entry.index}
                </td>
                <td>{entry.key || "—"}</td>
                <td>
                  {entry.value && entry.status === "occupied"
                    ? `${entry.value.fullName}, ${entry.value.address}`
                    : entry.status === "deleted"
                    ? `(удалено)`
                    : "—"}
                </td>
                <td style={{ textAlign: "center", fontFamily: "monospace" }}>
                  {entry.hashValue !== undefined ? entry.hashValue : "—"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {getStatusText(entry.status)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HashTableView;
