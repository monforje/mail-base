// src/renderer/src/components/PackagesSection/RBTreeStructureView.tsx
import React from "react";
import { Package } from "../../types";
import { packagesService } from "../../DataServices";

interface RBTreeStructureViewProps {
  packages: Package[];
}

const RBTreeStructureView: React.FC<RBTreeStructureViewProps> = () => {
  // Получаем структуру дерева для отображения
  const getTreeStructure = () => {
    return packagesService.getTreeStructure();
  };

  const treeStructure = getTreeStructure();
  const treeStats = packagesService.getTreeStatistics();

  const getCollisionColor = (packageCount: number): string => {
    if (packageCount === 1) return "#e8f5e8"; // Зеленый - нет коллизий
    if (packageCount <= 3) return "#fff3cd"; // Желтый - мало коллизий
    if (packageCount <= 5) return "#ffeaa7"; // Оранжевый - средне коллизий
    return "#ffebee"; // Красный - много коллизий
  };

  const getCollisionBadge = (packageCount: number): { text: string; color: string } => {
    if (packageCount === 1) return { text: "Нет коллизий", color: "#4caf50" };
    if (packageCount <= 3) return { text: "Мало коллизий", color: "#ff9800" };
    if (packageCount <= 5) return { text: "Средне коллизий", color: "#f57c00" };
    return { text: "Много коллизий", color: "#f44336" };
  };

  return (
    <div className="rbtree-structure-view" style={{ width: "100%", height: "100%", overflow: "auto" }}>
      {/* Заголовок с информацией о дереве */}
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
          <strong>Красно-черное дерево:</strong> {treeStats.uniqueSenders} узлов, {treeStats.size} посылок
        </span>
        <span style={{ color: "#666" }}>
          Высота: {treeStats.height} | Черная высота: {treeStats.blackHeight} | 
          Эффективность: {(treeStats.efficiency * 100).toFixed(1)}%
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
          📊 Всего посылок: {treeStats.size}
        </span>
        <span style={{ color: "#2196f3" }}>
          👥 Уникальных отправителей: {treeStats.uniqueSenders}
        </span>
        <span style={{ color: "#ff9800" }}>
          📈 Среднее на отправителя: {treeStats.averagePackagesPerSender.toFixed(1)}
        </span>
        <span style={{ color: treeStats.isValid ? "#4caf50" : "#f44336", marginLeft: "auto" }}>
          {treeStats.isValid ? "✓ Дерево валидное" : "✗ Дерево невалидное"}
        </span>
      </div>

      {treeStructure.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          <div style={{ fontSize: "16px", marginBottom: "12px" }}>
            🌳 Дерево пустое
          </div>
          <div style={{ fontSize: "14px" }}>
            Добавьте посылки для отображения структуры данных
          </div>
        </div>
      ) : (
        <table className="data-table" style={{ fontSize: "11px" }}>
          <thead>
            <tr>
              <th style={{ width: "140px", textAlign: "center" }}>Ключ (Отправитель)</th>
              <th style={{ width: "120px", textAlign: "center" }}>Тип коллизии</th>
              <th style={{ width: "100px", textAlign: "center" }}>Кол-во посылок</th>
              <th style={{ width: "250px" }}>Индексы в массиве</th>
              <th>Список посылок (двусвязный список)</th>
            </tr>
          </thead>
          <tbody>
            {treeStructure.map((node, nodeIndex) => {
              // Получаем данные посылок для этого отправителя
              const senderPackages = packagesService.findPackagesBySender(node.senderPhone);
              const collisionInfo = getCollisionBadge(node.packageCount);
              
              return (
                <tr 
                  key={nodeIndex}
                  style={{
                    backgroundColor: getCollisionColor(node.packageCount),
                  }}
                >
                  <td style={{ 
                    fontWeight: "bold", 
                    textAlign: "center", 
                    fontFamily: "monospace",
                    fontSize: "12px"
                  }}>
                    {node.senderPhone.toString()}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        color: "white",
                        backgroundColor: collisionInfo.color,
                      }}
                    >
                      {collisionInfo.text}
                    </span>
                  </td>
                  <td style={{ 
                    textAlign: "center", 
                    fontWeight: "bold",
                    fontSize: "12px"
                  }}>
                    {node.packageCount}
                  </td>
                  <td style={{ 
                    fontFamily: "monospace", 
                    fontSize: "10px",
                    padding: "4px 8px"
                  }}>
                    <div style={{
                      backgroundColor: "#f8f8f8",
                      padding: "4px 6px",
                      borderRadius: "3px",
                      border: "1px solid #ddd"
                    }}>
                      [{node.indices.join(", ")}]
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "10px" }}>
                      {senderPackages.map((pkg, pkgIndex) => (
                        <div
                          key={pkgIndex}
                          style={{
                            marginBottom: "2px",
                            padding: "3px 6px",
                            backgroundColor: pkgIndex % 2 === 0 ? "#ffffff" : "#f8f8f8",
                            borderRadius: "2px",
                            border: "1px solid #eee",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          <span style={{ 
                            fontWeight: "bold",
                            color: "#666",
                            minWidth: "0px"
                          }}>
                          </span>
                          <span style={{ color: "#2196f3" }}>
                            → {pkg.receiverPhone}
                          </span>
                          <span style={{ color: "#ff9800" }}>
                            {pkg.weight}кг
                          </span>
                          <span style={{ color: "#4caf50" }}>
                            {pkg.date}
                          </span>
                          {pkgIndex < senderPackages.length - 1 && (
                            <span style={{ color: "#999", fontSize: "8px" }}>
                              ↕ связь
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Информация о структуре */}
      {treeStructure.length > 0 && (
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
            <strong>Структура дерева:</strong> Ключ = номер телефона отправителя, Значение = двойной двусвязный список индексов
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>Обработка коллизий:</strong> Несколько посылок от одного отправителя хранятся в одном списке
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>Двусвязный список:</strong> O(1) добавление/удаление, прямой и обратный обход
          </div>
          <div style={{ marginBottom: "4px" }}>
            <strong>Поиск по отправителю:</strong> O(log n), где n = количество уникальных отправителей
          </div>
          <div>
            <strong>Цветовая индикация:</strong> 
            <span style={{ color: "#4caf50", marginLeft: "8px" }}>Зеленый = нет коллизий</span>
            <span style={{ color: "#ff9800", marginLeft: "8px" }}>Желтый = мало коллизий</span>
            <span style={{ color: "#f44336", marginLeft: "8px" }}>Красный = много коллизий</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RBTreeStructureView;