// src/renderer/src/components/PackagesSection/PackagesSection.tsx
import React from "react";
import PackagesTable from "./PackagesTable";
import RBTreeView from "./RBTreeView";
import { Package, ViewMode } from "../../types";
import "../../assets/PackagesSectionStyles/PackagesSection.css";

interface PackagesSectionProps {
  packages: Package[];
  viewMode: ViewMode;
}

const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  viewMode,
}) => {
  return (
    <div className="table-section">
      <div className="section-header">
        Посылки {viewMode === "structure" && "(Красно-черное дерево)"}
      </div>
      <div className="table-container">
        {viewMode === "table" ? (
          <PackagesTable packages={packages} />
        ) : (
          <RBTreeView packages={packages} />
        )}
      </div>
    </div>
  );
};

export default PackagesSection;
