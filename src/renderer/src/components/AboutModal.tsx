// src/renderer/src/components/AboutModal.tsx
import React from "react";
import { usersService, packagesService } from "../DataServices";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // ОБНОВЛЕНО: Получаем детальную статистику с новой структурой данных
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

  const getPackagesInfo = () => {
    return `- Посылки: Красно-черное дерево + двойные двусвязные списки
  • Всего посылок: ${packageStats.size}
  • Уникальных отправителей: ${packageStats.uniqueSenders}
  • Высота дерева: ${packageStats.height}
  • Черная высота: ${packageStats.blackHeight}
  • Эффективность: ${(packageStats.efficiency * 100).toFixed(1)}%
  • Среднее посылок на отправителя: ${packageStats.averagePackagesPerSender.toFixed(1)}
  • Валидность дерева: ${packageStats.isValid ? "корректное" : "некорректное"}`;
  };

  const aboutText = `Mail Base v1.0.0
Программа для управления пользователями и посылками

Поддерживаемые форматы:
- Телефон: 8XXXXXXXXXX (например: 89001234567)
- Дата: dd mmm yyyy (например: 15 jan 2025)

Структуры данных:
${getHashTableInfo()}

${getPackagesInfo()}

Архитектура системы:
- Хеш-таблица: метод серединного квадрата + линейный пробинг
- Красно-черное дерево: ключ = номер отправителя
- Двойные двусвязные списки: для хранения коллизий (индексов)
- Массивы данных: фактические данные без ключей

Особенности реализации:
- Размер хеш-таблицы выбирается пользователем при загрузке
- Таблица сбрасывается к размеру 0 при очистке данных
- В дереве ключ - номер телефона отправителя
- Значение в дереве - список индексов массива с данными посылок
- Коллизии (несколько посылок от одного отправителя) хранятся в списке
- Двусвязный список обеспечивает O(1) добавление и удаление

Алгоритмы поиска:
- Поиск пользователя: O(1) среднее время
- Поиск по отправителю: O(log n) + O(k), где k - количество посылок
- Поиск по получателю: O(n) - полный перебор всех посылок

Состояние приложения:
- Хеш-таблица: ${
    isHashTableInitialized ? "инициализирована" : "не инициализирована"
  }
- Всего пользователей: ${userStats.size}
- Всего посылок: ${packageStats.size}
- Уникальных отправителей: ${packageStats.uniqueSenders}`;

  React.useEffect(() => {
    if (isOpen) {
      alert(aboutText);
      onClose();
    }
  }, [isOpen, aboutText, onClose]);

  return null;
};

export default AboutModal;