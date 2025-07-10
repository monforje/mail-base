// src/renderer/src/components/AboutModal.tsx
import React from "react";
import { usersService, packagesService } from "../DataServices";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // ОБНОВЛЕНО: Получаем детальную статистику с проверкой инициализации
  const userStats = usersService.getStatistics();
  const packageStats = packagesService.getTreeStatistics();
  const isHashTableInitialized = usersService.isInitialized();

  const getHashTableInfo = () => {
    if (!isHashTableInitialized) {
      return `- Пользователи: Хеш-таблица (не инициализирована)
  • Размер таблицы: 0 ячеек
  • Статус: ожидает загрузки данных
  • Примечание: выберите размер при загрузке файла`;
    }

    return `- Пользователи: Хеш-таблица (${userStats.size} записей)
  • Размер таблицы: ${userStats.capacity} ячеек
  • Коэффициент загрузки: ${(userStats.loadFactor * 100).toFixed(1)}%
  • Занятых ячеек: ${userStats.distribution.occupiedSlots}
  • Пустых ячеек: ${userStats.distribution.emptySlots}
  • Удаленных ячеек: ${userStats.distribution.deletedSlots}`;
  };

  const aboutText = `Mail Base v1.0.0
Программа для управления пользователями и посылками

Поддерживаемые форматы:
- Телефон: 8XXXXXXXXXX (например: 89001234567)
- Дата: dd mmm yyyy (например: 15 jan 2025)

Структуры данных:
${getHashTableInfo()}

- Посылки: Красно-черное дерево (${packageStats.size} записей)
  • Высота дерева: ${packageStats.height}
  • Черная высота: ${packageStats.blackHeight}
  • Эффективность: ${(packageStats.efficiency * 100).toFixed(1)}%
  • Валидность: ${packageStats.isValid ? "корректное" : "некорректное"}

Особенности:
- Размер хеш-таблицы выбирается пользователем при загрузке
- Таблица сбрасывается к размеру 0 при очистке данных
- Используется метод серединного квадрата для хеширования
- Линейный пробинг с шагом для разрешения коллизий
- Красно-черное дерево для быстрого поиска посылок

Состояние приложения:
- Хеш-таблица: ${
    isHashTableInitialized ? "инициализирована" : "не инициализирована"
  }
- Всего пользователей: ${userStats.size}
- Всего посылок: ${packageStats.size}`;

  React.useEffect(() => {
    if (isOpen) {
      alert(aboutText);
      onClose();
    }
  }, [isOpen, aboutText, onClose]);

  return null;
};

export default AboutModal;
