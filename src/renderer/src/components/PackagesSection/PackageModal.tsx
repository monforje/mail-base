import React, { useState, useEffect } from "react";
import { Package } from "../../types";
import {
  validatePhoneNumber,
  validateWeight,
  validateDate,
  parsePhoneNumber,
  validateUserExists
} from "../../utils";
import { usersService } from "../../DataServices";

interface PackageModalProps {
  isOpen: boolean;
  mode: "search" | "add" | "delete";
  onClose: () => void;
  onSearch: (senderPhone: number) => void;
  onAdd: (pkg: Package) => void;
  onDelete: (senderPhone: number, receiverPhone: number, date: string) => void;
  searchResults?: Package[];
}

const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSearch,
  onAdd,
  onDelete,
  searchResults,
}) => {
  const [senderPhoneStr, setSenderPhoneStr] = useState("");
  const [receiverPhoneStr, setReceiverPhoneStr] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSenderPhoneStr("");
      setReceiverPhoneStr("");
      setWeight("");
      setDate("");
      setErrors([]);
    }
  }, [isOpen, mode]);

  const getTitle = () => {
    switch (mode) {
      case "search":
        return "Поиск посылок";
      case "add":
        return "Добавить посылку";
      case "delete":
        return "Удалить посылку";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!senderPhoneStr.trim()) {
      newErrors.push("Телефон отправителя обязателен для заполнения");
    } else if (!validatePhoneNumber(senderPhoneStr)) {
      newErrors.push(
        "Неверный формат телефона отправителя (ожидается 8XXXXXXXXXX)"
      );
    } else if (!validateUserExists(senderPhoneStr, usersService.getAllUsers())) {
      newErrors.push("Отправитель должен существовать среди пользователей");
    }

    if (mode === "add" || mode === "delete") {
      if (!receiverPhoneStr.trim()) {
        newErrors.push("Телефон получателя обязателен для заполнения");
      } else if (!validatePhoneNumber(receiverPhoneStr)) {
        newErrors.push(
          "Неверный формат телефона получателя (ожидается 8XXXXXXXXXX)"
        );
      } else if (!validateUserExists(receiverPhoneStr, usersService.getAllUsers())) {
        newErrors.push("Получатель должен существовать среди пользователей");
      }

      if (!weight.trim()) {
        newErrors.push("Вес обязателен для заполнения");
      } else if (!validateWeight(weight)) {
        newErrors.push("Неверный формат веса (ожидается положительное число с точкой, например 3.5)");
      }

      if (!date.trim()) {
        newErrors.push("Дата обязательна для заполнения");
      } else if (!validateDate(date)) {
        newErrors.push(
          'Неверный формат даты (ожидается "dd mon yyyy", например "15 jan 2025")'
        );
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const senderPhone = parsePhoneNumber(senderPhoneStr);
    if (senderPhone === null) {
      setErrors(["Ошибка парсинга номера телефона отправителя"]);
      return;
    }

    switch (mode) {
      case "search":
        onSearch(senderPhone);
        break;
      case "add":
        const receiverPhone = parsePhoneNumber(receiverPhoneStr);
        if (receiverPhone === null) {
          setErrors(["Ошибка парсинга номера телефона получателя"]);
          return;
        }
        onAdd({
          senderPhone,
          receiverPhone,
          weight: parseFloat(weight),
          date,
        });
        onClose();
        break;
      case "delete":
        const receiverPhoneForDelete = parsePhoneNumber(receiverPhoneStr);
        if (receiverPhoneForDelete === null) {
          setErrors(["Ошибка парсинга номера телефона получателя"]);
          return;
        }
        if (
          window.confirm(
            `Вы уверены, что хотите удалить посылку от ${senderPhone} к ${receiverPhoneForDelete} от ${date}?`
          )
        ) {
          onDelete(senderPhone, receiverPhoneForDelete, date);
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
            <label htmlFor="senderPhone">Телефон отправителя:</label>
            <input
              id="senderPhone"
              type="text"
              value={senderPhoneStr}
              onChange={(e) => setSenderPhoneStr(e.target.value)}
              placeholder="8XXXXXXXXXX"
              autoFocus
            />
          </div>

          {(mode === "add" || mode === "delete") && (
            <>
              <div className="form-group">
                <label htmlFor="receiverPhone">Телефон получателя:</label>
                <input
                  id="receiverPhone"
                  type="text"
                  value={receiverPhoneStr}
                  onChange={(e) => setReceiverPhoneStr(e.target.value)}
                  placeholder="8XXXXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Вес (кг):</label>
                <input
                  id="weight"
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="1.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Дата:</label>
                <input
                  id="date"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="15 jan 2025"
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

          {mode === "search" && searchResults !== undefined && (
            <div className="search-result">
              {searchResults.length > 0 ? (
                <div className="result-found">
                  <h4>Найдено посылок: {searchResults.length}</h4>
                  <div className="search-results-table">
                    <table>
                      <thead>
                        <tr>
                          <th>От</th>
                          <th>К</th>
                          <th>Вес</th>
                          <th>Дата</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.slice(0, 5).map((pkg, index) => (
                          <tr key={index}>
                            <td>{pkg.senderPhone.toString()}</td>
                            <td>{pkg.receiverPhone.toString()}</td>
                            <td>{pkg.weight}</td>
                            <td>{pkg.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {searchResults.length > 5 && (
                      <p className="more-results">
                        ... и еще {searchResults.length - 5} посылок
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="result-not-found">
                  <p>Посылки от отправителя {senderPhoneStr} не найдены</p>
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

export default PackageModal;
