import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./ThemeContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
