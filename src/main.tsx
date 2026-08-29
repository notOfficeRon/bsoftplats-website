import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StoriesErrorBoundary } from "./lib/stories";
import { StoriesPage } from "./pages/stories-page";
import { FEATURED_STORY_PATHS, StoryPage } from "./pages/story-page";
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
    if (FEATURED_STORY_PATHS.includes(path as (typeof FEATURED_STORY_PATHS)[number])) {
      return <StoryPage path={path} />;
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

