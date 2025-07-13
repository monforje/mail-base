import { Package } from "../../types";
import { packagesService } from "../../DataServices";
import RBTreeCanvas, { convertRBTreeToVisualTree } from "./RBTreeCanvas";
import React, { useMemo, useState, useEffect } from "react";
import { DoublyLinkedList } from "../../data-structures/DoublyLinkedList";

interface RBTreeViewProps {
  packages: Package[];
  onDataChange?: () => void;
  setPackages?: (pkgs: Package[]) => void;
}

const RBTreeView: React.FC<RBTreeViewProps> = ({ packages, onDataChange, setPackages }) => {
  // Состояние выбранной ноды
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // Получаем данные дерева и конвертируем для визуализации
  const treeData = useMemo(() => {
    try {
      // Получаем внутреннее дерево из сервиса через рефлексию
      const tree = (packagesService as any).redBlackTree;
      
      if (!tree || packages.length === 0) {
        return null;
      }

      // Конвертируем дерево для визуализации с форматированием узлов
      return convertRBTreeToVisualTree(tree, (key, value) => {
        // key - это номер телефона отправителя
        // value - это DoublyLinkedList с индексами посылок
        const indices = value ? (value as DoublyLinkedList<any>).toArray() : [];
        return `${key}\n[${indices.join(", ")}]`;
      });
    } catch (error) {
      console.error('Error converting tree data:', error);
      return null;
    }
  }, [packages]);

  // Получить подробные посылки по выбранному отправителю (selectedKey)
  const selectedPackages = useMemo(() => {
    if (!selectedKey) return [];
    const senderPhone = parseInt(selectedKey.split('\n')[0], 10);
    if (isNaN(senderPhone)) return [];
    // Получаем индексы из value (DoublyLinkedList) напрямую из дерева
    const tree = (packagesService as any).redBlackTree;
    if (!tree) return [];
    const node = tree.search(senderPhone.toString());
    if (!node) return [];
    const indices = node.toArray();
    // Получаем посылки по индексам
    const arr = (packagesService as any).packagesArray;
    return indices.map((idx: number) => {
      const data = arr.get(idx);
      if (!data) return null;
      return {
        senderPhone,
        receiverPhone: parseInt(data.receiverPhone, 10),
        weight: data.weight,
        date: data.date,
      };
    }).filter(Boolean);
  }, [selectedKey, packages]);

  // Удаление всех посылок выбранного отправителя по Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedKey) {
        const senderPhone = parseInt(selectedKey.split('\n')[0], 10);
        if (!isNaN(senderPhone)) {
          if (window.confirm(`Удалить все посылки отправителя ${senderPhone}?`)) {
            (packagesService as any).removeAllPackagesBySender(senderPhone);
            setSelectedKey(null);
            if (setPackages) setPackages(packagesService.getAllPackages());
            if (onDataChange) onDataChange();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKey, onDataChange, setPackages]);

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Канвас с деревом */}
      <div style={{
        flex: 1,
        padding: "20px",
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start"
      }}>
        <RBTreeCanvas
          treeData={treeData}
          width={Math.max(800, window.innerWidth - 100)}
          height={Math.max(600, window.innerHeight - 200)}
          selectedKey={selectedKey}
          onNodeClick={setSelectedKey}
        />
      </div>

      {/* Подсказки внизу */}
      <div style={{
        padding: "8px 12px",
        backgroundColor: "#f0f0f0",
        borderTop: "1px solid #ddd",
        fontSize: "11px",
        color: "#666",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            <strong>Структура:</strong> Ключ = телефон отправителя, Значение = список посылок
          </span>
          <span>
            <strong>Балансировка:</strong> Красно-черное дерево автоматически поддерживает логарифмическую высоту
          </span>
        </div>
      </div>

      {selectedKey && (
        <div style={{
          padding: "12px",
          backgroundColor: "#e3f2fd",
          borderTop: "1px solid #bbdefb",
          fontSize: "12px",
          color: "#1565c0"
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Детализация по отправителю: {selectedKey.split('\n')[0]}</strong>
            <button
              style={{
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 16px',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: 16
              }}
              onClick={() => {
                const senderPhone = parseInt(selectedKey.split('\n')[0], 10);
                if (!isNaN(senderPhone)) {
                  if (window.confirm(`Удалить все посылки отправителя ${senderPhone}?`)) {
                    (packagesService as any).removeAllPackagesBySender(senderPhone);
                    setSelectedKey(null);
                    if (setPackages) setPackages(packagesService.getAllPackages());
                    if (onDataChange) onDataChange();
                  }
                }
              }}
            >
              Удалить все посылки отправителя
            </button>
          </div>
          <table style={{ width: "100%", marginTop: 8, background: "white", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Тел. отправителя</th>
                <th>Тел. получателя</th>
                <th>Вес (кг)</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {selectedPackages.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>Нет посылок по выбранному отправителю</td></tr>
              ) : (
                selectedPackages.map((pkg: any, idx: number) => (
                  <tr key={idx}>
                    <td>{pkg.senderPhone}</td>
                    <td>{pkg.receiverPhone}</td>
                    <td>{pkg.weight}</td>
                    <td>{pkg.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RBTreeView;