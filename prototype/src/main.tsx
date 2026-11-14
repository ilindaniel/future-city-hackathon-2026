import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/lexend";
import "@fontsource-variable/pixelify-sans";
import { App } from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element is missing");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
