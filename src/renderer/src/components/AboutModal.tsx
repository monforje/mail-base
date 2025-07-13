import React from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          minWidth: 320,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          textAlign: "center",
          fontFamily: "inherit",
        }}
      >
        <h2 style={{ marginBottom: 8 }}>Почта</h2>
        <div style={{ marginBottom: 16, color: "#888" }}>версия 1.0.0</div>
        <div style={{ marginBottom: 16 }}>
          Простое приложение для учёта пользователей и посылок.
        </div>
        <div style={{ marginBottom: 24, fontSize: 13, color: "#888" }}>
          Автор: Даниил Комаров
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "8px 24px",
            borderRadius: 6,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default AboutModal;
