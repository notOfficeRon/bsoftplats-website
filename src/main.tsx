import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StoriesErrorBoundary } from "./lib/stories";
import { StoriesPage } from "./pages/stories-page";
import { VerifyContactPage } from "./pages/verify-contact-page";
import "./index.css";

function Root() {
  try {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/stories") {
      return (
        <StoriesErrorBoundary>
          <StoriesPage />
        </StoriesErrorBoundary>
      );
    }
    if (path === "/verify-contact") {
      return <VerifyContactPage />;
    }
    return <App />;
  } catch {
    return <App />;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

