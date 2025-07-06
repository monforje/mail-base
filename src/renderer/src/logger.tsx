import React from "react";
import ReactDOM from "react-dom/client";
import LoggerWindow from "./components/LoggerWindow";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <LoggerWindow />
  </React.StrictMode>
);
