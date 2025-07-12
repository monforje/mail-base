import React, { useState, useEffect } from "react";

interface HashTableSizeModalProps {
  isOpen: boolean;
  userCount: number;
  onClose: () => void;
  onConfirm: (size: number) => void;
}

const HashTableSizeModal: React.FC<HashTableSizeModalProps> = ({
  isOpen,
  userCount,
  onClose,
  onConfirm,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("1");
  const [customSize, setCustomSize] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const getNextPrime = (n: number): number => {
    let candidate = n;
    while (!isPrime(candidate)) {
      candidate++;
    }
    return candidate;
  };

  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const getRecommendedSizes = () => {
    const baseSize75 = Math.max(11, Math.ceil(userCount / 0.75));
    const baseSize50 = Math.max(17, Math.ceil(userCount / 0.5));
    const baseSize30 = Math.max(23, Math.ceil(userCount / 0.3));

    return [
      {
        size: getNextPrime(baseSize75),
        loadFactor: 0.75,
        description: "Оптимальный (75% загрузки)",
        recommended: true,
      },
      {
        size: getNextPrime(baseSize50),
        loadFactor: 0.5,
        description: "Сбалансированный (50% загрузки)",
        recommended: false,
      },
      {
        size: getNextPrime(baseSize30),
        loadFactor: 0.3,
        description: "Просторный (30% загрузки)",
        recommended: false,
      },
    ];
  };

  const recommendedSizes = getRecommendedSizes();

  useEffect(() => {
    if (isOpen) {
      setSelectedOption("1");
      setCustomSize("");
      setErrors([]);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (selectedOption === "4") {
      if (!customSize.trim()) {
        newErrors.push("Введите размер хеш-таблицы");
      } else {
        const parsedSize = parseInt(customSize, 10);
        if (isNaN(parsedSize) || parsedSize < 1) {
          newErrors.push("Размер должен быть положительным числом");
        } else if (parsedSize < 11) {
          newErrors.push("Минимальный размер: 11");
        } else if (parsedSize > 1000000) {
          newErrors.push("Максимальный размер: 1,000,000");
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let finalSize: number;

    switch (selectedOption) {
      case "1":
        finalSize = recommendedSizes[0].size;
        break;
      case "2":
        finalSize = recommendedSizes[1].size;
        break;
      case "3":
        finalSize = recommendedSizes[2].size;
        break;
      case "4":
        const parsedSize = parseInt(customSize, 10);
        finalSize = getNextPrime(Math.max(11, parsedSize));
        break;
      default:
        finalSize = recommendedSizes[0].size;
    }

    onConfirm(finalSize);
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
          <h3>Выбор размера хеш-таблицы</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
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
              Файл содержит: {userCount} пользователей
            </p>
            <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
              Выберите начальный размер хеш-таблицы. Размер будет округлен до
              ближайшего простого числа.
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 12px 0", fontWeight: "bold" }}>
              Рекомендуемые варианты:
            </p>

            {recommendedSizes.map((option, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor:
                      selectedOption === (index + 1).toString()
                        ? "#e3f2fd"
                        : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="sizeOption"
                    value={(index + 1).toString()}
                    checked={selectedOption === (index + 1).toString()}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    style={{ marginRight: "8px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: option.recommended ? "#1976d2" : "#333",
                      }}
                    >
                      {option.size} ячеек - {option.description}
                      {option.recommended && (
                        <span style={{ color: "#4caf50", marginLeft: "8px" }}>
                          ✓ Рекомендуется
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      Коэффициент загрузки:{" "}
                      {((userCount / option.size) * 100).toFixed(1)}%
                    </div>
                  </div>
                </label>
              </div>
            ))}

            <div style={{ marginTop: "12px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: selectedOption === "4" ? "#e3f2fd" : "white",
                }}
              >
                <input
                  type="radio"
                  name="sizeOption"
                  value="4"
                  checked={selectedOption === "4"}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  style={{ marginRight: "8px" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold" }}>
                    Пользовательский размер
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "2px",
                    }}
                  >
                    Введите желаемый размер
                  </div>
                </div>
              </label>
            </div>

            {selectedOption === "4" && (
              <div style={{ marginTop: "8px", marginLeft: "24px" }}>
                <input
                  type="text"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="Введите размер (например: 100)"
                  style={{
                    width: "200px",
                    padding: "6px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                  autoFocus={selectedOption === "4"}
                />
                {customSize && !isNaN(parseInt(customSize, 10)) && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Ближайшее простое число:{" "}
                    {getNextPrime(Math.max(11, parseInt(customSize, 10)))}
                    <br />
                    Коэффициент загрузки:{" "}
                    {(
                      (userCount /
                        getNextPrime(Math.max(11, parseInt(customSize, 10)))) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                )}
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
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
            }}
          >
            <p style={{ margin: "0", fontSize: "12px", color: "#856404" }}>
              <strong>Совет:</strong> Для оптимальной производительности
              рекомендуется коэффициент загрузки 60-80%. Слишком высокий
              коэффициент увеличивает количество коллизий, слишком низкий -
              расходует память.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Создать хеш-таблицу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HashTableSizeModal;
