// src/renderer/src/types.ts
// ИСПРАВЛЕНО: Телефоны теперь числа, а не строки (требование ПО)
export interface User {
  phone: number; // ИЗМЕНЕНО: было string, стало number
  fullName: string;
  address: string;
}

export interface Package {
  senderPhone: number; // ИЗМЕНЕНО: было string, стало number
  receiverPhone: number; // ИЗМЕНЕНО: было string, стало number
  weight: number;
  date: string;
}

// ДОБАВЛЕНО: Новый режим просмотра "datastructure"
export type ViewMode = "table" | "structure" | "datastructure";

export interface MenuStripProps {
  onUsersClear: () => void;
  onPackagesClear: () => void;
  onUsersSave: () => void;
  onPackagesSave: () => void;
  onFileLoad: (
    event: React.ChangeEvent<HTMLInputElement>,
    expectedType: "users" | "packages"
  ) => void;
  onAbout: () => void;
  onRefreshData: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  currentViewMode: ViewMode;
}

export interface UsersTableProps {
  users: User[];
}

export interface PackagesTableProps {
  packages: Package[];
}

// ДОБАВЛЕНО: Новые типы для модального окна выбора размера хеш-таблицы
export interface HashTableSizeOption {
  size: number;
  loadFactor: number;
  description: string;
  recommended: boolean;
}

export interface HashTableSizeModalProps {
  isOpen: boolean;
  userCount: number;
  onClose: () => void;
  onConfirm: (size: number) => void;
}

// ДОБАВЛЕНО: Типы для статистики хеш-таблицы
export interface HashTableStatistics {
  size: number;
  capacity: number;
  loadFactor: number;
  distribution: {
    emptySlots: number;
    occupiedSlots: number;
    deletedSlots: number;
  };
}

// ДОБАВЛЕНО: Типы для статистики красно-черного дерева
export interface RBTreeStatistics {
  size: number;
  height: number;
  blackHeight: number;
  isValid: boolean;
  efficiency: number;
}