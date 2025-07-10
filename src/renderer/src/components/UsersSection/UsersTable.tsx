// src/renderer/src/components/UsersSection/UsersTable.tsx
import React from "react";
import { UsersTableProps } from "../../types";
import "../../assets/UsersSectionStyles/UsersTable.css";

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Телефон</th>
          <th>ФИО</th>
          <th>Адрес</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={3} className="empty-message">
              Нет данных для отображения
            </td>
          </tr>
        ) : (
          users.map((user, index) => (
            <tr key={index}>
              <td>{user.phone.toString()}</td>
              <td>{user.fullName}</td>
              <td>{user.address}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default UsersTable;
