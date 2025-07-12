import { PackagesTableProps } from "../../types";
import React from "react";
import "../../assets/PackagesSectionStyles/PackagesTable.css";

const PackagesTable: React.FC<PackagesTableProps> = ({ packages }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Телефон отправителя</th>
          <th>Телефон получателя</th>
          <th>Вес (кг)</th>
          <th>Дата</th>
        </tr>
      </thead>
      <tbody>
        {packages.length === 0 ? (
          <tr>
            <td colSpan={4} className="empty-message">
              Нет данных для отображения
            </td>
          </tr>
        ) : (
          packages.map((pkg, index) => (
            <tr key={index}>
              <td>{pkg.senderPhone.toString()}</td>
              <td>{pkg.receiverPhone.toString()}</td>
              <td>{pkg.weight}</td>
              <td>{pkg.date}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default PackagesTable;
