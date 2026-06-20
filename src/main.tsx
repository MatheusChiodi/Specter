import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import App from "./App";
import Launcher from "./components/Launcher";
import "./styles/index.css";

// Um único bundle serve as duas janelas; o label decide o que renderizar.
const isLauncher = getCurrentWindow().label === "launcher";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>{isLauncher ? <Launcher /> : <App />}</React.StrictMode>,
);
