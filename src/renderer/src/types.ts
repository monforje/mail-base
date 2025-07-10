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

export type ViewMode = "table" | "structure";

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
