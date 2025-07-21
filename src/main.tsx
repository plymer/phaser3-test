import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { EngineProvider } from "@/engine/EngineContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EngineProvider>
      <App />
    </EngineProvider>
  </React.StrictMode>
);
