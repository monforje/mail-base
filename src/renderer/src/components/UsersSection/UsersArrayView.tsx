// src/renderer/src/components/UsersSection/UsersArrayView.tsx
import React, { useState } from "react";
import { User } from "../../types";
import { usersService } from "../../DataServices";
import "../../assets/ArrayView.css";

interface UsersArrayViewProps {
  users: User[];
}

const UsersArrayView: React.FC<UsersArrayViewProps> = ({ users }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Проверяем инициализацию хеш-таблицы
  const isInitialized = usersService.isInitialized();

  // Получаем все элементы массива (включая пустые)
  const getArrayElements = () => {
    if (!isInitialized || users.length === 0) {
      return [];
    }

    // Создаем массив элементов на основе данных
    const elements: Array<{
      index: number;
      user: User | null;
      isEmpty: boolean;
    }> = [];

    // Добавляем всех пользователей в соответствии с их позициями в массиве
    users.forEach((user, index) => {
      elements.push({
        index,
        user,
        isEmpty: false,
      });
    });

    return elements;
  };

  const arrayElements = getArrayElements();

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const formatTooltipContent = (user: User) => {
    return `ФИО: ${user.fullName}\nАдрес: ${user.address}`;
  };

  if (!isInitialized) {
    return (
      <div className="array-view">
        <div className="array-empty-state">
          <div className="array-empty-icon">📦</div>
          <div className="array-empty-text">Массив не инициализирован</div>
          <div className="array-empty-subtext">
            Загрузите пользователей из файла для отображения массива данных
          </div>
        </div>
      </div>
    );
  }

  if (arrayElements.length === 0) {
    return (
      <div className="array-view">
        <div className="array-empty-state">
          <div className="array-empty-icon">📦</div>
          <div className="array-empty-text">Массив данных пуст</div>
          <div className="array-empty-subtext">
            Добавьте пользователей для отображения элементов массива
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="array-view">
      <div className="array-container">
        {/* Элементы массива */}
        <div className="array-elements">
          {arrayElements.map((element) => (
            <div
              key={element.index}
              className={`array-element ${element.isEmpty ? "empty" : ""}`}
              onMouseEnter={() => handleMouseEnter(element.index)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Индекс элемента */}
              <div className="element-index">[{element.index}]</div>

              {element.isEmpty ? (
                <div className="element-empty">Пусто</div>
              ) : element.user ? (
                <>
                  {/* Ключ (телефон) */}
                  <div className="element-key">
                    {element.user.phone.toString()}
                  </div>

                  {/* Tooltip с полной информацией */}
                  {hoveredIndex === element.index && (
                    <div className="array-tooltip">
                      {formatTooltipContent(element.user)}
                    </div>
                  )}
                </>
              ) : (
                <div className="element-empty">Ошибка данных</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersArrayView;
