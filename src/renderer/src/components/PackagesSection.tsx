import React from "react";
import PackagesTable from "./PackagesTable";
import { Package } from "../types";
import "../assets/PackagesSection.css";

interface PackagesSectionProps {
  packages: Package[];
}

const PackagesSection: React.FC<PackagesSectionProps> = ({ packages }) => {
  return (
    <div className="table-section">
      <div className="section-header">Посылки</div>
      <div className="table-container">
        <PackagesTable packages={packages} />
      </div>
    </div>
  );
};

export default PackagesSection;
