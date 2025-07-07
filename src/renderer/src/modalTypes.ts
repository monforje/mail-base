// src/renderer/src/types/modalTypes.ts
export type ModalMode = "search" | "add" | "delete";

export interface BaseModalProps {
  isOpen: boolean;
  mode: ModalMode;
  onClose: () => void;
}
