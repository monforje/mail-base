import { packagesService } from "../../DataServices";
import { User, Package } from "../../types";
import {
  validatePhoneNumber,
  parsePhoneNumber,
  validateFullName,
  validateAddress,
  validateUniqueFullName,
  validateUniquePhone
} from "../../utils";
import React, { useState, useEffect } from "react";
import { usersService } from "../../DataServices";

interface UserModalProps {
  isOpen: boolean;
  mode: "search" | "add" | "delete";
  onClose: () => void;
  onSearch: (phone: number) => void;
  onAdd: (user: User) => void;
  onDelete: (phone: number) => void;
  searchResult?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSearch,
  onAdd,
  onDelete,
  searchResult,
}) => {
  const [phoneStr, setPhoneStr] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [relatedPackages, setRelatedPackages] = useState<Package[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhoneStr("");
      setFullName("");
      setAddress("");
      setErrors([]);
      setRelatedPackages([]);
      setShowDeleteConfirmation(false);
    }
  }, [isOpen, mode]);

  const getTitle = () => {
    switch (mode) {
      case "search":
        return "Поиск пользователя";
      case "add":
        return "Добавить пользователя";
      case "delete":
        return "Удалить пользователя";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!phoneStr.trim()) {
      newErrors.push("Телефон обязателен для заполнения");
    } else if (!validatePhoneNumber(phoneStr)) {
      newErrors.push("Неверный формат телефона (ожидается 8XXXXXXXXXX)");
    }

    if (mode === "add") {
      if (!validateUniquePhone(phoneStr, usersService.getAllUsers())) {
        newErrors.push("Пользователь с таким телефоном уже существует");
      }
      if (!fullName.trim()) {
        newErrors.push("ФИО обязательно для заполнения");
      } else if (!validateFullName(fullName)) {
        newErrors.push("ФИО должно состоять из трёх слов, каждое с заглавной буквы (например: Иванов Иван Иванович)");
      } else if (!validateUniqueFullName(fullName, usersService.getAllUsers())) {
        newErrors.push("Пользователь с таким ФИО уже существует");
      }
      if (!address.trim()) {
        newErrors.push("Адрес обязателен для заполнения");
      } else if (!validateAddress(address)) {
        newErrors.push("Адрес должен быть в формате: г. <город>, ул. <улица>, д. <номер>, кв. <номер>");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateSearchPhone = (phoneStr: string): string | null => {
    if (!validatePhoneNumber(phoneStr)) {
      return "Некорректный номер телефона";
    }
    return null;
  };

  const checkRelatedPackages = (phone: number): Package[] => {
    return packagesService.findPackagesBySender(phone);
  };

  const handleDeleteStep1 = () => {
    if (!validateForm()) return;

    const phone = parsePhoneNumber(phoneStr);
    if (phone === null) {
      setErrors(["Ошибка парсинга номера телефона"]);
      return;
    }

    const packages = checkRelatedPackages(phone);
    setRelatedPackages(packages);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    const phone = parsePhoneNumber(phoneStr);
    if (phone === null) {
      setErrors(["Ошибка парсинга номера телефона"]);
      return;
    }

    onDelete(phone);
    onClose();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setRelatedPackages([]);
  };

  const handleSearch = () => {
    const error = validateSearchPhone(phoneStr);
    if (error) return;
    onSearch(Number(phoneStr));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const phone = parsePhoneNumber(phoneStr);
    if (phone === null) {
      setErrors(["Ошибка парсинга номера телефона"]);
      return;
    }

    switch (mode) {
      case "search":
        handleSearch();
        break;
      case "add":
        onAdd({ phone, fullName, address });
        onClose();
        break;
      case "delete":
        handleDeleteStep1();
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (showDeleteConfirmation) {
        handleDeleteCancel();
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={showDeleteConfirmation ? undefined : onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{ maxWidth: showDeleteConfirmation ? "600px" : "400px" }}
      >
        <div className="modal-header">
          <h3>{getTitle()}</h3>
          <button
            className="modal-close"
            onClick={showDeleteConfirmation ? handleDeleteCancel : onClose}
          >
            ✕
          </button>
        </div>

        {showDeleteConfirmation ? (
          <div className="modal-form">
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                ⚠️ Подтверждение удаления пользователя
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                Вы собираетесь удалить пользователя: <strong>{phoneStr}</strong>
              </p>
            </div>

            {relatedPackages.length > 0 ? (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "4px",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontWeight: "bold",
                      color: "#856404",
                    }}
                  >
                    🚚 Связанные посылки (будут удалены)
                  </p>
                  <p
                    style={{ margin: "0", fontSize: "12px", color: "#856404" }}
                  >
                    Найдено {relatedPackages.length} посылок от этого
                    отправителя. При удалении пользователя все его посылки также
                    будут удалены.
                  </p>
                </div>

                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th
                          style={{
                            padding: "6px 8px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                            fontWeight: "bold",
                          }}
                        >
                          Получатель
                        </th>
                        <th
                          style={{
                            padding: "6px 8px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                            fontWeight: "bold",
                          }}
                        >
                          Вес
                        </th>
                        <th
                          style={{
                            padding: "6px 8px",
                            textAlign: "left",
                            borderBottom: "1px solid #ddd",
                            fontWeight: "bold",
                          }}
                        >
                          Дата
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedPackages.map((pkg, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                          }}
                        >
                          <td
                            style={{
                              padding: "4px 8px",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {pkg.receiverPhone.toString()}
                          </td>
                          <td
                            style={{
                              padding: "4px 8px",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {pkg.weight} кг
                          </td>
                          <td
                            style={{
                              padding: "4px 8px",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {pkg.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#e8f5e8",
                    border: "1px solid #c3e6c3",
                    borderRadius: "4px",
                  }}
                >
                  <p
                    style={{ margin: "0", fontSize: "14px", color: "#2d5a2d" }}
                  >
                    ✅ У этого пользователя нет связанных посылок.
                  </p>
                </div>
              </div>
            )}

            <div
              style={{
                padding: "12px",
                backgroundColor: "#ffebee",
                border: "1px solid #ffcdd2",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            >
              <p style={{ margin: "0", fontSize: "12px", color: "#c62828" }}>
                <strong>Внимание!</strong> Это действие необратимо.
                {relatedPackages.length > 0
                  ? ` Будет удален пользователь и ${relatedPackages.length} связанных посылок.`
                  : " Будет удален только пользователь."}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="btn-cancel"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn-primary"
                style={{ backgroundColor: "#d32f2f", borderColor: "#d32f2f" }}
              >
                {relatedPackages.length > 0
                  ? `Удалить пользователя и ${relatedPackages.length} посылок`
                  : "Удалить пользователя"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="phone">Телефон:</label>
              <input
                id="phone"
                type="text"
                value={phoneStr}
                onChange={(e) => setPhoneStr(e.target.value)}
                placeholder="8XXXXXXXXXX"
                autoFocus
              />
            </div>

            {mode === "add" && (
              <>
                <div className="form-group">
                  <label htmlFor="fullName">ФИО:</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Адрес:</label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                  />
                </div>
              </>
            )}

            {errors.length > 0 && (
              <div className="error-list">
                {errors.map((error, index) => (
                  <div key={index} className="error-message">
                    {error}
                  </div>
                ))}
              </div>
            )}

            {mode === "search" && searchResult !== undefined && (
              <div className="search-result">
                {searchResult ? (
                  <div className="result-found">
                    <h4>Пользователь найден:</h4>
                    <p>
                      <strong>Телефон:</strong> {searchResult.phone.toString()}
                    </p>
                    <p>
                      <strong>ФИО:</strong> {searchResult.fullName}
                    </p>
                    <p>
                      <strong>Адрес:</strong> {searchResult.address}
                    </p>
                  </div>
                ) : (
                  <div className="result-not-found">
                    <p>Пользователь с телефоном {phoneStr} не найден</p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Отмена
              </button>
              <button type="submit" className="btn-primary">
                {mode === "search"
                  ? "Найти"
                  : mode === "add"
                  ? "Добавить"
                  : "Проверить связанные данные"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserModal;
