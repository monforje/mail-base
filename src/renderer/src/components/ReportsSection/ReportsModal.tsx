import React, { useState, useEffect } from "react";
import { validateDate } from "../../utils";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (startDate?: string, endDate?: string) => void;
  availableDates: string[];
  dateRange: { startDate: string; endDate: string } | null;
}

const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  availableDates,
  dateRange,
}) => {
  const [filterType, setFilterType] = useState<"all" | "date" | "range">("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFilterType("all");
      setSelectedDate("");
      setStartDate("");
      setEndDate("");
      setErrors([]);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (filterType === "date") {
      if (!selectedDate.trim()) {
        newErrors.push("Выберите дату из списка");
      } else if (!availableDates.includes(selectedDate)) {
        newErrors.push("Выбранная дата не найдена в данных");
      }
    } else if (filterType === "range") {
      if (!startDate.trim()) {
        newErrors.push("Дата начала обязательна для заполнения");
      } else if (!validateDate(startDate)) {
        newErrors.push('Неверный формат даты начала (ожидается "dd mmm yyyy")');
      }

      if (!endDate.trim()) {
        newErrors.push("Дата окончания обязательна для заполнения");
      } else if (!validateDate(endDate)) {
        newErrors.push(
          'Неверный формат даты окончания (ожидается "dd mmm yyyy")'
        );
      }

      if (
        startDate &&
        endDate &&
        validateDate(startDate) &&
        validateDate(endDate)
      ) {
        if (startDate > endDate) {
          newErrors.push("Дата начала не может быть позже даты окончания");
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    switch (filterType) {
      case "all":
        onGenerate();
        break;
      case "date":
        onGenerate(selectedDate, selectedDate);
        break;
      case "range":
        onGenerate(startDate, endDate);
        break;
    }

    onClose();
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
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-header">
          <h3>Генерация отчета по посылкам</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {dateRange && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                Доступные данные:
              </p>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                Период: {dateRange.startDate} - {dateRange.endDate} (
                {availableDates.length} уникальных дат)
              </p>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 12px 0", fontWeight: "bold" }}>
              Фильтр по дате:
            </p>

            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: filterType === "all" ? "#e3f2fd" : "white",
                }}
              >
                <input
                  type="radio"
                  name="filterType"
                  value="all"
                  checked={filterType === "all"}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  style={{ marginRight: "8px" }}
                />
                <div>
                  <div style={{ fontWeight: "bold" }}>Все записи</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Показать все посылки без фильтрации
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: filterType === "date" ? "#e3f2fd" : "white",
                }}
              >
                <input
                  type="radio"
                  name="filterType"
                  value="date"
                  checked={filterType === "date"}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  style={{ marginRight: "8px" }}
                />
                <div>
                  <div style={{ fontWeight: "bold" }}>Конкретная дата</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Показать посылки за определенную дату
                  </div>
                </div>
              </label>
            </div>

            {filterType === "date" && (
              <div style={{ marginTop: "8px", marginLeft: "24px" }}>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">Выберите дату...</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: filterType === "range" ? "#e3f2fd" : "white",
                }}
              >
                <input
                  type="radio"
                  name="filterType"
                  value="range"
                  checked={filterType === "range"}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  style={{ marginRight: "8px" }}
                />
                <div>
                  <div style={{ fontWeight: "bold" }}>Период дат</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Показать посылки за определенный период
                  </div>
                </div>
              </label>
            </div>

            {filterType === "range" && (
              <div style={{ marginTop: "8px", marginLeft: "24px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Дата начала:
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="15 jan 2025"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Дата окончания:
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="31 dec 2025"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div className="error-list">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #bbdefb",
              borderRadius: "4px",
            }}
          >
            <p style={{ margin: "0", fontSize: "12px", color: "#1565c0" }}>
              <strong>Информация:</strong> Отчет будет содержать данные о
              посылках с полной информацией об отправителях (ФИО и адрес).
              Записи без информации об отправителе будут исключены из отчета.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Сформировать отчет
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportsModal;
