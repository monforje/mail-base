import React, { useState } from "react";
import { ReportData } from "../../data-structures/ReportsArray";
import { ReportsService } from "../../services/ReportsService";
import { User, Package } from "../../types";
import { usersService, packagesService } from "../../DataServices";
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
  setReportStatistics: React.Dispatch<
    React.SetStateAction<{
      totalReports: number;
      uniqueDates: number;
      totalWeight: number;
      averageWeight: number;
    } | null>
  >;
  reportIsLoading: boolean;
  setReportIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReportsSection: React.FC<ReportsSectionProps> = ({
  users,
  packages,
  reportData,
  setReportData,
  reportStatistics,
  setReportStatistics,
  reportIsLoading,
  setReportIsLoading,
}) => {
  const [reportsService] = useState(new ReportsService());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    const allPackages = packagesService.getAllPackages();
    const allUsers = usersService.getAllUsers();
    
    if (allPackages.length === 0) {
      alert("Нет данных о посылках для формирования отчета");
      return;
    }
    if (allUsers.length === 0) {
      alert("Нет данных о пользователях для формирования отчета");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleGenerateReport = async (
    startDate?: string, 
    endDate?: string, 
    receiverPhone?: string, 
    address?: string
  ) => {
    setReportIsLoading(true);

    try {
      // Получаем данные напрямую из сервисов
      const allUsers = usersService.getAllUsers();
      const allPackages = packagesService.getAllPackages();
      
      // Генерируем полный отчет
      reportsService.generateReport(allUsers, allPackages);

      // Применяем фильтрацию с новыми параметрами
      const filteredReports = reportsService.getReportsByFilters(
        startDate,
        endDate,
        receiverPhone,
        address
      );

      setReportData(filteredReports);

      // Обновляем статистику для отфильтрованных данных
      const totalWeight = filteredReports.reduce(
        (sum, report) => sum + report.weight,
        0
      );
      const uniqueDates = new Set(filteredReports.map((report) => report.date))
        .size;

      setReportStatistics({
        totalReports: filteredReports.length,
        uniqueDates,
        totalWeight,
        averageWeight:
          filteredReports.length > 0 ? totalWeight / filteredReports.length : 0,
      });

      if (filteredReports.length === 0) {
        let message = "Нет данных для отчета.";
        if (startDate && endDate) {
          message += ` Период: ${startDate} - ${endDate}`;
        }
        if (receiverPhone) {
          message += ` Телефон получателя: ${receiverPhone}`;
        }
        if (address) {
          message += ` Адрес: ${address}`;
        }
        alert(message);
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
      const blob = new Blob([exportData], {
        type: "text/plain; charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      // Формируем имя файла с текущей датой
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
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
    // Получаем уникальные даты из красно-черного дерева посылок
    const allPackages = packagesService.getAllPackages();
    const dates = Array.from(new Set(allPackages.map((pkg) => pkg.date))).sort();
    return dates;
  };

  const getDateRange = () => {
    const dates = getAvailableDates();
    if (dates.length === 0) return null;

    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
    };
  };

  const getAvailablePhones = () => {
    // Получаем уникальные телефоны получателей из красно-черного дерева посылок
    const allPackages = packagesService.getAllPackages();
    const phones = Array.from(new Set(allPackages.map((pkg) => pkg.receiverPhone.toString()))).sort();
    return phones;
  };

  const getAvailableAddresses = () => {
    // Получаем уникальные адреса из хеш-таблицы пользователей
    const allUsers = usersService.getAllUsers();
    const addresses = Array.from(new Set(allUsers.map((user) => user.address))).sort();
    return addresses;
  };

  return (
    <>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #ccc",
        }}
      >
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

        <div
          style={{
            flex: 1,
            overflow: "auto",
            minHeight: 0,
          }}
        >
          {reportIsLoading ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#666",
                fontSize: "16px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                ⏳ Формирование отчета...
              </div>
              <div style={{ fontSize: "14px" }}>
                Обработка {packages.length} посылок и {users.length}{" "}
                пользователей
              </div>
            </div>
          ) : (
            <>
              {reportStatistics && (
                <div
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: "#fafafa",
                    fontSize: "12px",
                    padding: "8px 12px",
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
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
                    📊 Средний вес: {reportStatistics.averageWeight.toFixed(2)}{" "}
                    кг
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
        availablePhones={getAvailablePhones()}
        availableAddresses={getAvailableAddresses()}
      />
    </>
  );
};

export default ReportsSection;
