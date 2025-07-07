// src/renderer/src/types.ts
export interface User {
  phone: string;
  fullName: string;
  address: string;
}

export interface Package {
  senderPhone: string;
  receiverPhone: string;
  weight: number;
  date: string;
}

export type ViewMode = 'table' | 'structure';

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