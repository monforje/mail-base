// src/renderer/src/components/AboutModal.tsx
import React from "react";
import { usersService, packagesService } from "../DataServices";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const aboutText = `Mail Base v1.0.0
Программа для управления пользователями и посылками

Поддерживаемые форматы:
- Телефон: 8XXXXXXXXXX (например: 89001234567)
- Дата: dd mmm yyyy (например: 15 jan 2025)

Структуры данных:
- Пользователи: Хеш-таблица (${usersService.getCount()} записей)
- Посылки: Красно-черное дерево (${packagesService.getCount()} записей)

Статистика хеш-таблицы: коэффициент загрузки ${(
    usersService.getCount() / usersService.getCapacity()
  ).toFixed(2)}
Статистика дерева: высота ${packagesService.getHeight()}, черная высота ${packagesService.getBlackHeight()}`;

  React.useEffect(() => {
    if (isOpen) {
      alert(aboutText);
      onClose();
    }
  }, [isOpen, aboutText, onClose]);

  return null;
};

export default AboutModal;
