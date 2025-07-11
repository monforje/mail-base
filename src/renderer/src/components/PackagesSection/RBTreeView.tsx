import React from "react";
import { Package } from "../../types";

interface RBTreeViewProps {
  packages: Package[];
}

const RBTreeView: React.FC<RBTreeViewProps> = ({ packages }) => {
  return (
    <div className="rbtree-view" style={{ width: "100%", height: "100%" }}>
      {/* Встраиваем внешний HTML-файл VIZUAL.html через iframe */}
      <iframe
        src="/RedBlack.html"
        title="RB-Tree Visualization"
        style={{
          width: "100%",
          height: "500px",
          border: "none",
        }}
      />
      <div style={{ padding: "10px 20px", textAlign: "center", color: "#666" }}>
        Всего посылок: {packages.length}
      </div>
    </div>
  );
};

export default RBTreeView;
