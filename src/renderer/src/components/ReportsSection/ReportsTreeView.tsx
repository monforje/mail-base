import React from "react";
import { User, Package } from "../../types";

interface ReportsTreeViewProps {
  users: User[];
  packages: Package[];
}

const ReportsTreeView: React.FC<ReportsTreeViewProps> = ({ users, packages }) => {
  const getUniqueeDates = () => {
    return Array.from(new Set(packages.map(pkg => pkg.date))).sort();
  };

  const uniqueDates = getUniqueeDates();

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
          >
            🔄
          </button>
          <button
            className="action-icon"
            title="Настройки отображения"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflow: "auto",
        minHeight: 0,
        backgroundColor: "#fafafa"
      }}>
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
            Визуализация красно-черного дерева отчетов
          </div>
          
          <div style={{ 
            fontSize: "16px", 
            marginBottom: "24px",
            maxWidth: "600px",
            lineHeight: "1.5"
          }}>
            Здесь будет интерактивная визуализация красно-черного дерева,
            где ключами выступают даты отправки посылок, а значениями - 
            двусвязные списки индексов отчетов.
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
                Статистика дерева:
              </div>
              
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "14px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>📅 Узлов (дат):</span>
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

              {uniqueDates.length > 0 && (
                <div style={{ 
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid #eee"
                }}>
                  <div style={{ 
                    fontSize: "12px", 
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#666"
                  }}>
                    Диапазон дат:
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {uniqueDates[0]} — {uniqueDates[uniqueDates.length - 1]}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{
            marginTop: "32px",
            fontSize: "12px",
            color: "#999",
            fontStyle: "italic"
          }}>
            Компонент в разработке. Будет добавлена интерактивная визуализация дерева.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTreeView;