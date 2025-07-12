import { usersService } from "../../DataServices";
import { User } from "../../types";
import React, { useState } from "react";
import "../../assets/ArrayView.css";

interface UsersArrayViewProps {
  users: User[];
}

const UsersArrayView: React.FC<UsersArrayViewProps> = ({ users }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isInitialized = usersService.isInitialized();

  const getArrayElements = () => {
    if (!isInitialized || users.length === 0) return [];

    const elements: {
      index: number;
      user: User | null;
      isEmpty: boolean;
    }[] = [];

    users.forEach((user) => {
      const arrayIndex = usersService.getArrayIndexByPhone(
        user.phone.toString()
      );

      if (arrayIndex === null) return;

      elements.push({
        index: arrayIndex,
        user,
        isEmpty: false,
      });
    });

    elements.sort((a, b) => a.index - b.index);

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
    return `Телефон: ${user.phone.toString()}\nФИО: ${user.fullName}\nАдрес: ${
      user.address
    }`;
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
      <div className="array-elements">
        {arrayElements.map((element) => (
          <div
            key={element.index}
            className={`array-element ${element.isEmpty ? "empty" : ""}`}
            onMouseEnter={() => handleMouseEnter(element.index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="element-index">[{element.index}]</div>

            {element.isEmpty ? (
              <div className="element-empty">Пусто</div>
            ) : element.user ? (
              <>
                <div className="element-key">
                  {element.user.phone.toString()}
                </div>

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
  );
};

export default UsersArrayView;
