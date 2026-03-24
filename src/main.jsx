import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";
import "./index.css";
import App from "./App.jsx";
import SolanaProvider from "./components/wallet/SolanaProvider.jsx";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SolanaProvider>
      <App />
    </SolanaProvider>
  </React.StrictMode>
);
