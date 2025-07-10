// src/renderer/src/components/UsersSection/HashTableStructureView.tsx
import React from "react";
import { User } from "../../types";
import { usersService } from "../../DataServices";

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
  // Проверка инициализации хеш-таблицы
  const isInitialized = usersService.isInitialized();
  const stats = usersService.getStatistics();

  // Получаем структуру хеш-таблицы
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

  // Отображение неинициализированного состояния
  if (!isInitialized) {
    return (
      <div className="hashtable-structure-view" style={{ width: "100%", height: "100%", overflow: "auto" }}>
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
    <div className="hashtable-structure-view" style={{ width: "100%", height: "100%", overflow: "auto" }}>
      {/* Заголовок с информацией о хеш-таблице */}
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
          <strong>Хеш-таблица:</strong> {stats.capacity} ячеек, {stats.size} записей
        </span>
        <span style={{ color: "#666" }}>
          Загрузка: {(stats.loadFactor * 100).toFixed(1)}% | 
          Метод серединного квадрата + линейный пробинг
        </span>
      </div>

      {/* Статистика */}
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

      {/* Таблица структуры */}
      <table className="data-table" style={{ fontSize: "11px" }}>
        <thead>
          <tr>
            <th style={{ width: "60px", textAlign: "center" }}>Индекс ХТ</th>
            <th style={{ width: "100px" }}>Статус</th>
            <th style={{ width: "140px" }}>Ключ (Телефон)</th>
            <th style={{ width: "80px", textAlign: "center" }}>Хеш</th>
            <th style={{ width: "80px", textAlign: "center" }}>Индекс массива</th>
            <th style={{ width: "180px" }}>ФИО</th>
            <th>Адрес</th>
          </tr>
        </thead>
        <tbody>
          {hashTableEntries.map((entry, idx) => {
            // Получаем индекс в массиве данных для занятых ячеек
            let arrayIndex: number | null = null;
            if (entry.status === "occupied" && entry.key) {
              // Получаем индекс напрямую из хеш-таблицы через публичный API
              const phoneKey = entry.key;
              // Используем приватный доступ через any для получения реального индекса
              try {
                const hashTable = (usersService as any).hashTable;
                if (hashTable && hashTable.get) {
                  const result = hashTable.get(phoneKey);
                  arrayIndex = typeof result === 'number' ? result : null;
                }
              } catch (e) {
                // Fallback - используем порядковый номер среди занятых ячеек
                const occupiedEntries = hashTableEntries.filter(e => e.status === "occupied");
                const currentOccupiedIndex = occupiedEntries.findIndex(e => e.key === entry.key);
                arrayIndex = currentOccupiedIndex >= 0 ? currentOccupiedIndex : null;
              }
            }

            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: getStatusColor(entry.status),
                  borderLeft: `3px solid ${getStatusBadgeColor(entry.status)}`,
                }}
              >
                <td style={{ textAlign: "center", fontWeight: "bold", fontFamily: "monospace" }}>
                  {entry.index}
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor: getStatusBadgeColor(entry.status),
                    }}
                  >
                    {getStatusText(entry.status)}
                  </span>
                </td>
                <td style={{ fontFamily: "monospace" }}>
                  {entry.key || "—"}
                </td>
                <td style={{ textAlign: "center", fontFamily: "monospace" }}>
                  {entry.hashValue !== undefined ? entry.hashValue : "—"}
                </td>
                <td style={{ textAlign: "center", fontFamily: "monospace", fontWeight: "bold" }}>
                  {entry.status === "occupied" && arrayIndex !== null ? (
                    <span style={{ 
                      backgroundColor: "#e3f2fd", 
                      padding: "2px 4px", 
                      borderRadius: "3px",
                      color: "#1976d2"
                    }}>
                      [{arrayIndex}]
                    </span>
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

      {/* Информация о структуре */}
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
          <strong>Алгоритм хеширования:</strong> Метод серединного квадрата
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Разрешение коллизий:</strong> Линейный пробинг с шагом h_i(k) = (h(k) + i × k) mod m
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Ленивое удаление:</strong> Удаленные записи помечаются как tombstone (статус "Удалено")
        </div>
        <div style={{ marginBottom: "4px" }}>
          <strong>Архитектура:</strong> 
          <span style={{ color: "#1976d2", marginLeft: "8px" }}>Индекс ХТ</span> → 
          <span style={{ color: "#4caf50", marginLeft: "4px" }}>Ключ (телефон)</span> → 
          <span style={{ color: "#ff9800", marginLeft: "4px" }}>Хеш-значение</span> → 
          <span style={{ color: "#1976d2", marginLeft: "4px" }}>[Индекс массива]</span> → 
          <span style={{ color: "#666", marginLeft: "4px" }}>Данные пользователя</span>
        </div>
        <div>
          <strong>Связь данных:</strong> Хеш-таблица хранит только индексы, фактические данные (ФИО + адрес) находятся в массиве
        </div>
      </div>
    </div>
  );
};

export default HashTableStructureView;