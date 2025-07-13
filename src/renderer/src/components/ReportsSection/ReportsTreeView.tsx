import React, { useState, useMemo } from "react";
import { User, Package } from "../../types";
import { ReportsService } from "../../services/ReportsService";
import RBTreeCanvas, { convertRBTreeToVisualTree } from "../PackagesSection/RBTreeCanvas";
import { DoublyLinkedList } from "../../data-structures/DoublyLinkedList";

interface ReportsTreeViewProps {
  users: User[];
  packages: Package[];
}

const ReportsTreeView: React.FC<ReportsTreeViewProps> = ({ users, packages }) => {
  const [reportsService] = useState(() => new ReportsService());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Генерируем отчет и получаем данные дерева
  const { treeData, stats } = useMemo(() => {
    try {
      // Генерируем отчет
      reportsService.generateReport(users, packages);
      
      // Получаем внутреннее дерево из сервиса
      const tree = (reportsService as any).dateTree;
      
      if (!tree || packages.length === 0) {
        return { treeData: null, stats: null };
      }

      // Конвертируем дерево для визуализации
      const visualTree = convertRBTreeToVisualTree(tree, (date, value) => {
        // date - это дата
        // value - это DoublyLinkedList с индексами отчетов
        const reportCount = value ? (value as DoublyLinkedList<any>).getSize() : 0;
        return `${date}\n(${reportCount} отчетов)`;
      });

      // Получаем статистику
      const treeStats = reportsService.getTreeStatistics();
      const generalStats = reportsService.getStatistics();

      return { 
        treeData: visualTree, 
        stats: { ...treeStats, ...generalStats }
      };
    } catch (error) {
      console.error('Error generating reports tree:', error);
      return { treeData: null, stats: null };
    }
  }, [users, packages, reportsService]);

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(packages.map(pkg => pkg.date))).sort();
  }, [packages]);

  // Обработчик клика по узлу дерева
  const handleNodeClick = (nodeKey: string) => {
    // Извлекаем дату из ключа узла (до символа переноса строки)
    const date = nodeKey.split('\n')[0];
    setSelectedDate(date);
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      border: "1px solid #ccc"
    }}>
      <div className="section-header">
        <div className="section-title">
          Визуализация дерева отчетов ({uniqueDates.length} уникальных дат)
        </div>
        <div className="section-actions">
          <button
            className="action-icon"
            title="Обновить визуализацию"
            onClick={() => {
              // Принудительно перерендериваем компонент
              setSelectedDate(null);
            }}
          >
            🔄
          </button>
          <button
            className="action-icon"
            title="Сбросить выделение"
            onClick={() => setSelectedDate(null)}
          >
            ⚙️
          </button>
        </div>
      </div>

      {stats && (
        <div style={{
          padding: "12px",
          backgroundColor: "#f9f9f9",
          borderBottom: "1px solid #ddd",
          fontSize: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ color: "#4caf50" }}>
              📋 Всего отчетов: {stats.totalReports}
            </span>
            <span style={{ color: "#2196f3" }}>
              📅 Уникальных дат: {stats.uniqueDates}
            </span>
            <span style={{ color: "#ff9800" }}>
              📏 Высота дерева: {stats.height}
            </span>
            <span style={{ color: "#9c27b0" }}>
              ⚫ Черная высота: {stats.blackHeight}
            </span>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <span style={{ 
              color: stats.isValid ? "#4caf50" : "#f44336",
              fontWeight: "bold"
            }}>
              {stats.isValid ? "✓ Дерево валидное" : "✗ Дерево невалидное"}
            </span>
            <span style={{ color: "#666" }}>
              📊 Эффективность: {(stats.efficiency * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Легенда */}
      <div style={{
        padding: "8px 12px",
        backgroundColor: "#fafafa",
        borderBottom: "1px solid #eee",
        fontSize: "11px",
        display: "flex",
        gap: "20px",
        alignItems: "center"
      }}>
        <span style={{ color: "#333", fontWeight: "bold" }}>Легенда:</span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#ff4444",
            border: "1px solid #222"
          }}></div>
          <span>Красный узел</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#333333",
            border: "1px solid #222"
          }}></div>
          <span>Черный узел</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#2196f3",
            border: "1px solid #1976d2"
          }}></div>
          <span>Выбранная дата</span>
        </div>
        <span style={{ marginLeft: "20px", color: "#666" }}>
          Кликните на узел для выделения даты
        </span>
      </div>

      <div style={{
        flex: 1,
        overflow: "auto",
        minHeight: 0,
        backgroundColor: "#fafafa"
      }}>
        {!treeData ? (
          <div style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#666",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{ 
              fontSize: "48px", 
              marginBottom: "24px",
              opacity: 0.3
            }}>
              🌳
            </div>
            
            <div style={{ 
              fontSize: "24px", 
              marginBottom: "16px",
              fontWeight: "bold"
            }}>
              Нет данных для построения дерева
            </div>
            
            <div style={{ 
              fontSize: "16px", 
              marginBottom: "24px",
              maxWidth: "600px",
              lineHeight: "1.5"
            }}>
              Загрузите пользователей и посылки для создания интерактивной 
              визуализации красно-черного дерева отчетов по датам.
            </div>

            {uniqueDates.length > 0 && (
              <div style={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                maxWidth: "500px",
                width: "100%"
              }}>
                <div style={{ 
                  fontSize: "14px", 
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333"
                }}>
                  Доступные данные:
                </div>
                
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📅 Дат в данных:</span>
                    <strong>{uniqueDates.length}</strong>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📦 Всего посылок:</span>
                    <strong>{packages.length}</strong>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>👥 Пользователей:</span>
                    <strong>{users.length}</strong>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📊 Среднее на дату:</span>
                    <strong>{uniqueDates.length > 0 ? (packages.length / uniqueDates.length).toFixed(1) : 0}</strong>
                  </div>
                </div>

                <div style={{ 
                  marginTop: "16px",
                  fontSize: "12px",
                  color: "#f44336",
                  textAlign: "center"
                }}>
                  ⚠️ Для создания отчетов нужны данные о пользователях
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "100%"
          }}>
            <RBTreeCanvas
              treeData={treeData}
              selectedKey={selectedDate ? `${selectedDate}\n` : null}
              width={Math.max(800, window.innerWidth - 100)}
              height={Math.max(600, window.innerHeight - 250)}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}
      </div>

      {/* Информация о выбранной дате */}
      {selectedDate && (
        <div style={{
          padding: "12px",
          backgroundColor: "#e3f2fd",
          borderTop: "1px solid #bbdefb",
          fontSize: "12px",
          color: "#1565c0"
        }}>
          <strong>Выбранная дата: {selectedDate}</strong>
          {stats && (
            <span style={{ marginLeft: "20px" }}>
              Отчетов за эту дату: {
                reportsService.getReportsByDate(selectedDate).length
              }
            </span>
          )}
        </div>
      )}

      {/* Подсказки */}
      <div style={{
        padding: "8px 12px",
        backgroundColor: "#f0f0f0",
        borderTop: "1px solid #ddd",
        fontSize: "11px",
        color: "#666"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            <strong>Структура:</strong> Ключ = дата отправки, Значение = список индексов отчетов
          </span>
          <span>
            <strong>Использование:</strong> Кликните на узел для выделения конкретной даты
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportsTreeView;