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
  hash: number;
  status: "empty" | "occupied" | "collision";
}

const HashTableView: React.FC<HashTableViewProps> = ({}) => {
  // Получаем доступ к внутренней структуре хеш-таблицы
  const getHashTableStructure = (): HashTableEntry[] => {
    const hashTable = (usersService as any).hashTable;
    const capacity = hashTable.getCapacity();
    const table = (hashTable as any).table;
    const entries: HashTableEntry[] = [];

    for (let i = 0; i < capacity; i++) {
      let current = table[i];
      let chainPosition = 0;

      if (current === null) {
        // Пустая ячейка
        entries.push({
          index: i,
          key: "",
          value: null,
          hash: 0,
          status: "empty",
        });
      } else {
        // Обходим цепочку коллизий
        while (current !== null) {
          const status = chainPosition === 0 ? "occupied" : "collision";
          entries.push({
            index: chainPosition === 0 ? i : -1, // -1 для элементов цепочки
            key: current.key,
            value: current.value,
            hash: current.keyHash,
            status,
          });
          current = current.next;
          chainPosition++;
        }
      }
    }

    return entries;
  };

  const hashTableEntries = getHashTableStructure();

  return (
    <div className="hashtable-structure">
      <table className="data-table">
        <thead>
          <tr>
            <th>Индекс</th>
            <th>Ключ</th>
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
              <tr key={idx}>
                <td>{entry.index === -1 ? "└─" : entry.index}</td>
                <td>{entry.key || "—"}</td>
                <td>{entry.value ? entry.value.fullName + ", " + entry.value.address : "—"}</td>
                <td>
                  {entry.hash !== 0
                    ? entry.hash.toString(16).toUpperCase()
                    : "—"}
                </td>
                <td>
                  {entry.status === "empty"
                    ? "Пусто"
                    : entry.status === "occupied"
                    ? "Занято"
                    : "Коллизия"}
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
