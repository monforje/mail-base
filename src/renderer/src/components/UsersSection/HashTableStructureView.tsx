import { usersService } from "../../DataServices";
import { User } from "../../types";
import React from "react";
import "../../assets/StructureView.css";

interface HashTableStructureViewProps {
  users: User[];
}

interface HashTableEntry {
  index: number;
  key: string;
  value: User | null;
  status: "empty" | "occupied" | "deleted";
  hashValue?: number;
}

const HashTableStructureView: React.FC<HashTableStructureViewProps> = () => {
  const isInitialized = usersService.isInitialized();
  const stats = usersService.getStatistics();

  const getHashTableStructure = (): HashTableEntry[] => {
    if (!isInitialized) {
      return [];
    }
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
        return "#f8f8f8";
      case "occupied":
        return "#e8f5e8";
      case "deleted":
        return "#ffebee";
      default:
        return "#ffffff";
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "empty":
        return "#999";
      case "occupied":
        return "#4caf50";
      case "deleted":
        return "#f44336";
      default:
        return "#999";
    }
  };

  if (!isInitialized) {
    return (
      <div
        className="hashtable-structure-view structure-view"
        style={{ width: "100%", height: "100%", overflow: "auto" }}
      >
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          <div style={{ fontSize: "16px", marginBottom: "12px" }}>
            🔧 Хеш-таблица не инициализирована
          </div>
          <div style={{ fontSize: "14px" }}>
            Загрузите пользователей из файла для создания структуры данных
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="hashtable-structure-view structure-view"
      style={{ width: "100%", height: "100%", overflow: "auto" }}
    >
      <div
        style={{
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          fontSize: "12px",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          <strong>Хеш-таблица:</strong> {stats.capacity} ячеек, {stats.size}{" "}
          записей
        </span>
        <span style={{ color: "#666" }}>
          Загрузка: {(stats.loadFactor * 100).toFixed(1)}% | Метод серединного
          квадрата + линейный пробинг
        </span>
      </div>

      <div
        style={{
          borderBottom: "1px solid #eee",
          backgroundColor: "#fafafa",
          fontSize: "11px",
          padding: "6px 12px",
          display: "flex",
          gap: "20px",
        }}
      >
        <span style={{ color: "#4caf50" }}>
          ✓ Занято: {stats.distribution.occupiedSlots}
        </span>
        <span style={{ color: "#999" }}>
          ○ Пусто: {stats.distribution.emptySlots}
        </span>
        <span style={{ color: "#f44336" }}>
          ✗ Удалено: {stats.distribution.deletedSlots}
        </span>
        <span style={{ color: "#666", marginLeft: "auto" }}>
          Коэффициент загрузки: {(stats.loadFactor * 100).toFixed(1)}%
        </span>
      </div>

      <table
        className="data-table structure-table"
        style={{ fontSize: "11px" }}
      >
        <thead>
          <tr>
            <th style={{ width: "60px", textAlign: "center" }}>Индекс ХТ</th>
            <th style={{ width: "100px" }}>Статус</th>
            <th style={{ width: "140px" }}>Ключ (Телефон)</th>
            <th style={{ width: "80px", textAlign: "center" }}>Хеш</th>
            <th style={{ width: "80px", textAlign: "center" }}>
              Индекс массива
            </th>
            <th style={{ width: "180px" }}>ФИО</th>
            <th>Адрес</th>
          </tr>
        </thead>
        <tbody>
          {hashTableEntries.map((entry, idx) => {
            const arrayIndex: number | null =
              entry.status === "occupied" && entry.key
                ? usersService.getArrayIndexByPhone(entry.key)
                : null;
            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: getStatusColor(entry.status),
                  borderLeft: `3px solid ${getStatusBadgeColor(entry.status)}`,
                }}
              >
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                  }}
                >
                  {entry.index}
                </td>
                <td>
                  <span className={`status-badge ${entry.status}`}>
                    {getStatusText(entry.status)}
                  </span>
                </td>
                <td style={{ fontFamily: "monospace" }}>{entry.key || "—"}</td>
                <td style={{ textAlign: "center", fontFamily: "monospace" }}>
                  {entry.hashValue !== undefined ? entry.hashValue : "—"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  {entry.status === "occupied" && arrayIndex !== null ? (
                    <span className="array-index">[{arrayIndex}]</span>
                  ) : entry.status === "deleted" ? (
                    <span style={{ color: "#999" }}>(удален)</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {entry.value && entry.status === "occupied"
                    ? entry.value.fullName
                    : entry.status === "deleted"
                    ? "(данные удалены)"
                    : "—"}
                </td>
                <td>
                  {entry.value && entry.status === "occupied"
                    ? entry.value.address
                    : entry.status === "deleted"
                    ? "(данные удалены)"
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          borderTop: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          fontSize: "11px",
          padding: "8px 12px",
          color: "#666",
        }}
      >
        <div style={{ marginBottom: "4px" }}>
          <strong>Алгоритм хеширования:</strong> Метод серединного квадрата - h(k) = ⌊(k^2 ÷ 10^r) / 10^s⌋ mod m
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Разрешение коллизий:</strong> Линейный пробинг с шагом h_i(k)
          = (h(k) + i × k) mod m
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Ленивое удаление:</strong> Удаленные записи помечаются как
          tombstone (статус "Удалено")
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Архитектура:</strong>
          <span style={{ color: "#1976d2", marginLeft: "8px" }}>
            Индекс ХТ
          </span>{" "}
          →
          <span style={{ color: "#4caf50", marginLeft: "4px" }}>
            Ключ (телефон)
          </span>{" "}
          →
          <span style={{ color: "#ff9800", marginLeft: "4px" }}>
            Хеш-значение
          </span>{" "}
          →
          <span style={{ color: "#1976d2", marginLeft: "4px" }}>
            [Индекс массива]
          </span>{" "}
          →
          <span style={{ color: "#666", marginLeft: "4px" }}>
            Данные пользователя
          </span>
        </div>
        <div>
          <strong>Связь данных:</strong> Хеш-таблица хранит только индексы,
          фактические данные (ФИО + адрес) находятся в массиве
        </div>
      </div>
    </div>
  );
};

export default HashTableStructureView;
