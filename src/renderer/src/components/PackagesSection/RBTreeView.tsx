// src/renderer/src/components/PackagesSection/RBTreeView.tsx
import React from "react";
import { Package } from "../../types";


interface RBTreeViewProps {
  packages: Package[];
}

const RBTreeView: React.FC<RBTreeViewProps> = ({ packages }) => {
  return (
    <div className="rbtree-view">
      {/* Пустой блок для будущей реализации визуализации красно-черного дерева */}
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        Визуализация красно-черного дерева посылок
        <br />
        (в разработке)
        <br />
        Посылок: {packages.length}
      </div>
    </div>
  );
};

export default RBTreeView;