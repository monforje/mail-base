import LoggerWindow from "./components/LoggerWindow";
import React from "react";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <LoggerWindow />
  </React.StrictMode>
);
