import React, { useState } from "react";
import { ReportData } from "../../data-structures/ReportsArray";
import { ReportsService } from "../../services/ReportsService";
import { User, Package } from "../../types";
import ReportsModal from "./ReportsModal";
import ReportsTable from "./ReportsTable";
import "../../assets/Modal.css";

interface ReportsSectionProps {
  users: User[];
  packages: Package[];
  reportData: ReportData[];
  setReportData: React.Dispatch<React.SetStateAction<ReportData[]>>;
  reportStatistics: {
    totalReports: number;
    uniqueDates: number;
    totalWeight: number;
    averageWeight: number;
  } | null;
  setReportStatistics: React.Dispatch<React.SetStateAction<{
    totalReports: number;
    uniqueDates: number;
    totalWeight: number;
    averageWeight: number;
  } | null>>;
  reportIsLoading: boolean;
  setReportIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReportsSection: React.FC<ReportsSectionProps> = ({ users, packages, reportData, setReportData, reportStatistics, setReportStatistics, reportIsLoading, setReportIsLoading }) => {
  const [reportsService] = useState(new ReportsService());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (packages.length === 0) {
      alert("Нет данных о посылках для формирования отчета");
      return;
    }
    if (users.length === 0) {
      alert("Нет данных о пользователях для формирования отчета");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleGenerateReport = async (startDate?: string, endDate?: string) => {
    setReportIsLoading(true);
    
    try {
      // Генерируем полный отчет
      reportsService.generateReport(users, packages);
      
      // Применяем фильтрацию если указаны даты
      let filteredReports: ReportData[];
      
      if (startDate && endDate) {
        filteredReports = reportsService.getReportsByDateRange(startDate, endDate);
      } else {
        filteredReports = reportsService.getAllReports();
      }
      
      setReportData(filteredReports);
      
      // Обновляем статистику для отфильтрованных данных
      const totalWeight = filteredReports.reduce((sum, report) => sum + report.weight, 0);
      const uniqueDates = new Set(filteredReports.map(report => report.date)).size;
      
      setReportStatistics({
        totalReports: filteredReports.length,
        uniqueDates,
        totalWeight,
        averageWeight: filteredReports.length > 0 ? totalWeight / filteredReports.length : 0,
      });
      
      if (filteredReports.length === 0) {
        if (startDate && endDate) {
          alert(`Нет данных для выбранного периода: ${startDate} - ${endDate}`);
        } else {
          alert("Нет данных для отчета. Возможно, отсутствуют пользователи для некоторых отправителей.");
        }
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Ошибка при формировании отчета: ${error}`);
    } finally {
      setReportIsLoading(false);
    }
  };

  const handleExportReport = () => {
    if (reportData.length === 0) {
      alert("Нет данных для экспорта. Сначала сформируйте отчет.");
      return;
    }

    try {
      const exportData = reportsService.exportToText(reportData);
      const blob = new Blob([exportData], { type: "text/plain; charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      
      // Формируем имя файла с текущей датой
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      a.download = `report_packages_${dateStr}.txt`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      alert(`Ошибка при экспорте отчета: ${error}`);
    }
  };

  const handleClearReport = () => {
    if (reportData.length === 0) {
      alert("Отчет уже пуст");
      return;
    }
    
    if (window.confirm("Вы уверены, что хотите очистить текущий отчет?")) {
      setReportData([]);
      setReportStatistics(null);
      reportsService.clear();
      console.log("Report cleared");
    }
  };

  const getSectionTitle = () => {
    if (reportStatistics) {
      return `Отчёт "Информация по посылкам" (${reportStatistics.totalReports} записей, ${reportStatistics.uniqueDates} дат)`;
    }
    return 'Отчёт "Информация по посылкам"';
  };

  const getAvailableDates = () => {
    // Получаем уникальные даты из текущих посылок
    const dates = Array.from(new Set(packages.map(pkg => pkg.date))).sort();
    return dates;
  };

  const getDateRange = () => {
    const dates = getAvailableDates();
    if (dates.length === 0) return null;
    
    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1]
    };
  };

  return (
    <>
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ccc"
      }}>
        <div className="section-header">
          <div className="section-title">{getSectionTitle()}</div>
          <div className="section-actions">
            <button
              className="action-icon"
              onClick={handleOpenModal}
              title="Сформировать отчет"
              disabled={reportIsLoading}
            >
              📊
            </button>
            <button
              className="action-icon"
              onClick={handleExportReport}
              title="Экспортировать отчет"
              disabled={reportIsLoading || reportData.length === 0}
            >
              💾
            </button>
            <button
              className="action-icon"
              onClick={handleClearReport}
              title="Очистить отчет"
              disabled={reportIsLoading || reportData.length === 0}
            >
              🗑️
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflow: "auto",
          minHeight: 0
        }}>
          {reportIsLoading ? (
            <div style={{ 
              padding: "40px 20px", 
              textAlign: "center", 
              color: "#666",
              fontSize: "16px" 
            }}>
              <div style={{ marginBottom: "12px" }}>⏳ Формирование отчета...</div>
              <div style={{ fontSize: "14px" }}>
                Обработка {packages.length} посылок и {users.length} пользователей
              </div>
            </div>
          ) : (
            <>
              {reportStatistics && (
                <div style={{
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fafafa",
                  fontSize: "12px",
                  padding: "8px 12px",
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap"
                }}>
                  <span style={{ color: "#4caf50" }}>
                    📋 Записей: {reportStatistics.totalReports}
                  </span>
                  <span style={{ color: "#2196f3" }}>
                    📅 Дат: {reportStatistics.uniqueDates}
                  </span>
                  <span style={{ color: "#ff9800" }}>
                    ⚖️ Общий вес: {reportStatistics.totalWeight.toFixed(2)} кг
                  </span>
                  <span style={{ color: "#9c27b0" }}>
                    📊 Средний вес: {reportStatistics.averageWeight.toFixed(2)} кг
                  </span>
                </div>
              )}
              <ReportsTable reports={reportData} />
            </>
          )}
        </div>
      </div>

      <ReportsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onGenerate={handleGenerateReport}
        availableDates={getAvailableDates()}
        dateRange={getDateRange()}
      />
    </>
  );
};

export default ReportsSection;