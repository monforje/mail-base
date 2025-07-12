import { Package } from "../../types";
import React from "react";

interface RBTreeViewProps {
  packages: Package[];
}

const RBTreeView: React.FC<RBTreeViewProps> = ({ packages }) => {
  return (
    <div className="rbtree-view">
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
