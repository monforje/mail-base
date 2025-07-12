import { Package } from "../../types";
import React, { useState } from "react";
import "../../assets/ArrayView.css";
import { packagesService } from "../../DataServices";

interface PackagesArrayViewProps {
  packages: Package[];
}

const PackagesArrayView: React.FC<PackagesArrayViewProps> = ({ packages }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getArrayElements = () => {
    if (packages.length === 0) return [];

    const elements: { index: number; package: Package; isEmpty: boolean }[] =
      [];

    packages.forEach((pkg) => {
      const arrayIndex = packagesService.getArrayIndexForPackage(pkg);
      if (arrayIndex === null) return; // безопасно пропускаем

      elements.push({ index: arrayIndex, package: pkg, isEmpty: false });
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

  const formatTooltipContent = (pkg: Package) => {
    return `Телефон: ${pkg.senderPhone.toString()}\nПолучатель: ${pkg.receiverPhone.toString()}\nВес: ${
      pkg.weight
    } кг\nДата: ${pkg.date}`;
  };

  const getElementKey = (pkg: Package) => {
    return pkg.senderPhone.toString();
  };

  if (arrayElements.length === 0) {
    console.log("Current hoveredIndex:", hoveredIndex);

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
            ) : element.package ? (
              <>
                <div className="element-key">
                  {getElementKey(element.package)}
                </div>

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
