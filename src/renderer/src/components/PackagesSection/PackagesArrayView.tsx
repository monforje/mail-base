// src/renderer/src/components/PackagesSection/PackagesArrayView.tsx
import React, { useState } from "react";
import { Package } from "../../types";
import "../../assets/ArrayView.css";

interface PackagesArrayViewProps {
  packages: Package[];
}

const PackagesArrayView: React.FC<PackagesArrayViewProps> = ({ packages }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Получаем все элементы массива (включая пустые)
  const getArrayElements = () => {
    if (packages.length === 0) {
      return [];
    }

    // Создаем массив элементов на основе данных
    const elements: Array<{
      index: number;
      package: Package | null;
      isEmpty: boolean;
    }> = [];

    // Добавляем все посылки в соответствии с их позициями в массиве
    packages.forEach((pkg, index) => {
      elements.push({
        index,
        package: pkg,
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

  const formatTooltipContent = (pkg: Package) => {
    return `Телефон: ${pkg.senderPhone.toString()}\nПолучатель: ${pkg.receiverPhone.toString()}\nВес: ${
      pkg.weight
    } кг\nДата: ${pkg.date}`;
  };

  const getElementKey = (pkg: Package) => {
    // Показываем отправителя как ключ, т.к. по нему индексируется дерево
    return pkg.senderPhone.toString();
  };

  if (arrayElements.length === 0) {
    console.log("Current hoveredIndex:", hoveredIndex); // Отладка

    return (
      <div className="array-view">
        <div className="array-empty-state">
          <div className="array-empty-icon">📦</div>
          <div className="array-empty-text">Массив данных пуст</div>
          <div className="array-empty-subtext">
            Добавьте посылки для отображения элементов массива
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="array-view">
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
            ) : element.package ? (
              <>
                {/* Ключ (отправитель) - показываем для понимания связи с деревом */}
                <div className="element-key">
                  {getElementKey(element.package)}
                </div>

                {/* Tooltip с полной информацией */}
                {hoveredIndex === element.index && (
                  <div className="array-tooltip">
                    {formatTooltipContent(element.package)}
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

export default PackagesArrayView;
