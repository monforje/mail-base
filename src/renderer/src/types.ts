export interface User {
  phone: number;
  fullName: string;
  address: string;
}

export interface Package {
  senderPhone: number;
  receiverPhone: number;
  weight: number;
  date: string;
}

export type ViewMode = "table" | "structure" | "datastructure" | "arrayview";

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

export interface RBTreeStatistics {
  size: number;
  height: number;
  blackHeight: number;
  isValid: boolean;
  efficiency: number;
}
