// src/renderer/src/components/PackagesSection/RBTreeView.tsx
import React, { useEffect, useRef } from "react";
import { Package } from "../../types";

interface RBTreeViewProps {
  packages: Package[];
}

const RBTreeView: React.FC<RBTreeViewProps> = ({ packages }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Отправляем данные в iframe при изменении packages
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    console.log(`RBTreeView: Отправляем ${packages.length} посылок в iframe`);

    try {
      iframe.contentWindow.postMessage(
        {
          type: "LOAD_PACKAGES",
          packages: packages,
        },
        "*"
      );
    } catch (error) {
      console.error("RBTreeView: Ошибка отправки данных:", error);
    }
  }, [packages]);

  // Обработчик загрузки iframe
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    console.log("RBTreeView: Iframe загружен, отправляем данные");

    // Небольшая задержка чтобы скрипты в iframe успели инициализироваться
    setTimeout(() => {
      try {
        iframe.contentWindow!.postMessage(
          {
            type: "LOAD_PACKAGES",
            packages: packages,
          },
          "*"
        );
      } catch (error) {
        console.error(
          "RBTreeView: Ошибка отправки данных после загрузки:",
          error
        );
      }
    }, 1000);
  };

  return (
    <div className="rbtree-view" style={{ width: "100%", height: "100%" }}>
      <iframe
        ref={iframeRef}
        src="/RedBlack.html"
        title="RB-Tree Visualization"
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
        onLoad={handleIframeLoad}
      />

      <div
        style={{
          padding: "10px 20px",
          textAlign: "center",
          color: "#666",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #ddd",
          fontSize: "14px",
        }}
      >
        <strong>Всего посылок:</strong> {packages.length} |
        <strong> Уникальных отправителей:</strong>{" "}
        {[...new Set(packages.map((p) => p.senderPhone))].length}
        <br />
        <small>Ключи дерева: номера телефонов отправителей</small>
      </div>
    </div>
  );
};

export default RBTreeView;
