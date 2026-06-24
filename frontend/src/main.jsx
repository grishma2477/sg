import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";

Sentry.init({
  dsn:              import.meta.env.VITE_SENTRY_DSN,   // TODO: set VITE_SENTRY_DSN in frontend/.env
  environment:      import.meta.env.MODE,
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  enabled:          !!import.meta.env.VITE_SENTRY_DSN,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    
    <Router>
      <App />
    </Router>
  </StrictMode>
);
