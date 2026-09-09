import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StoriesErrorBoundary } from "./lib/stories";
import { StoriesPage } from "./pages/stories-page";
import { FEATURED_STORY_PATHS, StoryPage } from "./pages/story-page";
import { VerifyContactPage } from "./pages/verify-contact-page";
import ogImage from "./images/bsoftplatslogo.png";
import "./index.css";

const SITE_NAME = "BSoftPlats";

function siteOrigin() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "https://bsoftplats-website.vercel.app";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, type?: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  if (type) el.setAttribute("type", type);
}

function setFavicon() {
  upsertLink("icon", ogImage, "image/png");
  upsertLink("shortcut icon", ogImage, "image/png");
  upsertLink("apple-touch-icon", ogImage);
}

setFavicon();

function applySeo(input: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "article";
}) {
  const origin = siteOrigin();
  const url = `${origin}${input.path === "/" ? "/" : input.path}`;
  const image = `${origin}${ogImage}`;
  const fullTitle = input.title.includes(SITE_NAME) ? input.title : `${input.title} · ${SITE_NAME}`;

  document.title = fullTitle;
  upsertMeta("name", "description", input.description);
  upsertMeta("name", "robots", input.index === false ? "noindex, nofollow" : "index, follow");
  upsertMeta("property", "og:type", input.type ?? "website");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", fullTitle);
  upsertMeta("property", "og:description", input.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", image);
  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", fullTitle);
  upsertMeta("name", "twitter:description", input.description);
  upsertMeta("name", "twitter:image", image);
  upsertLink("canonical", url);
  setFavicon();
}

function seoForPath(path: string) {
  if (path === "/stories") {
    applySeo({
      title: "Success Stories",
      description: "Case studies from BSoftPlats: FinOps, delivery, and platform work.",
      path,
    });
    return;
  }
  if (path === "/wrong-numbers-were-hiding-real-cloud-waste") {
    applySeo({
      title: "Wrong numbers were hiding real cloud waste",
      description:
        "How we fixed a global IoT provider's dashboards, and found real savings underneath. 8× inflated readings, $0 fix, $30–45K / year estimated savings.",
      path,
      type: "article",
    });
    return;
  }
  if (path === "/a-free-network-fix-ended-a-recurring-cost-spike") {
    applySeo({
      title: "A free network fix ended a recurring cost spike",
      description:
        "How we traced a spend alert to one missing network setting, and removed the charge for good. ≈ $11.5K avoidable in the week measured.",
      path,
      type: "article",
    });
    return;
  }
  if (path === "/spend-spikes-were-found-on-the-invoice") {
    applySeo({
      title: "Spend spikes in seconds. Finding out took days.",
      description:
        "Cloud and AI bills lived in five places, held together by a spreadsheet. We put every line on one pane, with a named owner. Days to find out became four hours.",
      path,
      type: "article",
    });
    return;
  }
  if (path === "/verify-contact") {
    applySeo({
      title: "Confirm your request",
      description: "Confirm your BSoftPlats inquiry or application.",
      path,
      index: false,
    });
    return;
  }
  applySeo({
    title: "DevOps, product engineering, and FinOps",
    description:
      "BSoftPlats builds reliable DevOps systems, ships product fast, and cuts cloud waste. Talk to us about delivery, infrastructure, or joining the team.",
    path: "/",
  });
}

function Root() {
  try {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    seoForPath(path);
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
    seoForPath("/");
    return <App />;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

