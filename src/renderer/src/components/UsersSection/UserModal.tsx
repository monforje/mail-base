// src/renderer/src/components/UsersSection/UserModal.tsx
import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { validatePhoneNumber } from "../../utils";

interface UserModalProps {
  isOpen: boolean;
  mode: "search" | "add" | "delete";
  onClose: () => void;
  onSearch: (phone: string) => void;
  onAdd: (user: User) => void;
  onDelete: (phone: string) => void;
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
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Сброс формы при открытии
      setPhone("");
      setFullName("");
      setAddress("");
      setErrors([]);
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

    if (!phone.trim()) {
      newErrors.push("Телефон обязателен для заполнения");
    } else if (!validatePhoneNumber(phone)) {
      newErrors.push("Неверный формат телефона (ожидается 8XXXXXXXXXX)");
    }

    if (mode === "add") {
      if (!fullName.trim()) {
        newErrors.push("ФИО обязательно для заполнения");
      }
      if (!address.trim()) {
        newErrors.push("Адрес обязателен для заполнения");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    switch (mode) {
      case "search":
        onSearch(phone);
        break;
      case "add":
        onAdd({ phone, fullName, address });
        onClose();
        break;
      case "delete":
        if (
          window.confirm(
            `Вы уверены, что хотите удалить пользователя ${phone}?`
          )
        ) {
          onDelete(phone);
          onClose();
        }
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <h3>{getTitle()}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="phone">Телефон:</label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                    <strong>Телефон:</strong> {searchResult.phone}
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
                  <p>Пользователь с телефоном {phone} не найден</p>
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
                : "Удалить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
