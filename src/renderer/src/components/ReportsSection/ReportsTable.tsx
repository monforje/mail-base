import React from "react";
import { ReportData } from "../../data-structures/ReportsArray";

interface ReportsTableProps {
  reports: ReportData[];
}

const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th style={{ width: "120px" }}>Дата</th>
          <th style={{ width: "140px" }}>Тел. отправителя</th>
          <th style={{ width: "200px" }}>ФИО отправителя</th>
          <th style={{ width: "250px" }}>Адрес отправителя</th>
          <th style={{ width: "140px" }}>Тел. получателя</th>
          <th style={{ width: "100px" }}>Вес (кг)</th>
        </tr>
      </thead>
      <tbody>
        {reports.length === 0 ? (
          <tr>
            <td colSpan={6} className="empty-message">
              Нет данных для отображения. Сформируйте отчет для просмотра
              результатов.
            </td>
          </tr>
        ) : (
          reports.map((report, index) => (
            <tr key={index}>
              <td>{report.date}</td>
              <td>{report.senderPhone}</td>
              <td>{report.senderName}</td>
              <td>{report.senderAddress}</td>
              <td>{report.receiverPhone}</td>
              <td>{report.weight}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ReportsTable;
