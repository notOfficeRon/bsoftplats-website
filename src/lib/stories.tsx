import { Component, type ErrorInfo, type ReactNode } from "react";
import fallbackCover from "@/images/bsoftplatslogo.png";

export const FALLBACK_STORY_IMAGE = fallbackCover;

export type Story = {
  slug: string;
  title: string;
  description: string;
  link: string;
  imageSrc: string;
  imageMode: "normal" | "bw";
  featuredIndex: 1 | 2 | 3 | null;
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseImageMode(value: unknown): "normal" | "bw" {
  try {
    const normalized = safeString(value)
      .toLowerCase()
      .replace(/[^a-z]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");

    if (
      normalized === "black and white" ||
      normalized === "bw" ||
      normalized === "b w" ||
      normalized === "grayscale" ||
      normalized === "greyscale"
    ) {
      return "bw";
    }
  } catch {
    return "normal";
  }
  return "normal";
}

function safeLink(value: unknown) {
  try {
    const trimmed = safeString(value).trim();
    if (!trimmed) return "#";
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:")) return "#";
    return trimmed;
  } catch {
    return "#";
  }
}

function folderFromPath(filePath: string) {
  try {
    const parts = filePath.split("/");
    return parts[parts.length - 2] ?? "";
  } catch {
    return "";
  }
}

function dirFromPath(filePath: string) {
  try {
    const index = filePath.lastIndexOf("/");
    return index === -1 ? filePath : filePath.slice(0, index);
  } catch {
    return "";
  }
}

function isHiddenFolder(slug: string) {
  try {
    const name = slug.trim().toLowerCase();
    return name.startsWith("_") || name === "example" || name === "template";
  } catch {
    return true;
  }
}

function featuredIndexFromSlug(slug: string): 1 | 2 | 3 | null {
  try {
    const normalized = slug.trim().toLowerCase().replace(/[\s_]+/g, "-");
    const match = /^featured-([123])$/.exec(normalized);
    if (!match) return null;
    const index = Number(match[1]);
    if (index === 1 || index === 2 || index === 3) return index;
  } catch {
    return null;
  }
  return null;
}

function parseStoryMarkdown(raw: unknown) {
  const fields: Record<string, string> = {};
  try {
    const text = safeString(raw).replace(/\r\n/g, "\n");
    for (const line of text.split("\n")) {
      try {
        const match = /^(title|description|link|image mode|image_mode)\s*:\s*(.*)$/i.exec(line);
        if (!match) continue;
        fields[match[1].toLowerCase()] = match[2].trim();
      } catch {
        continue;
      }
    }
  } catch {
    // keep empty fields
  }

  return {
    title: safeString(fields.title),
    description: safeString(fields.description),
    link: safeLink(fields.link),
    imageMode: parseImageMode(fields["image mode"] ?? fields.image_mode),
  };
}

function readMarkdownFiles() {
  try {
    return import.meta.glob("../../stories/**/*.md", {
      eager: true,
      query: "?raw",
      import: "default",
    }) as Record<string, string>;
  } catch {
    return {};
  }
}

function readImageFiles() {
  try {
    return import.meta.glob("../../stories/**/*.{png,jpg,jpeg,webp,gif,svg}", {
      eager: true,
      query: "?url",
      import: "default",
    }) as Record<string, string>;
  } catch {
    return {};
  }
}

const markdownFiles = readMarkdownFiles();
const imageFiles = readImageFiles();

function imageForStory(dir: string) {
  try {
    const inFolder = Object.entries(imageFiles).filter(([path, src]) => {
      return path.startsWith(`${dir}/`) && typeof src === "string" && src.length > 0;
    });
    const png = inFolder.find(([path]) => path.toLowerCase().endsWith(".png"));
    return png?.[1] ?? inFolder[0]?.[1] ?? FALLBACK_STORY_IMAGE;
  } catch {
    return FALLBACK_STORY_IMAGE;
  }
}

function loadStories(): Story[] {
  const stories: Story[] = [];
  try {
    const byFolder = new Map<string, { path: string; raw: string }>();

    for (const [path, raw] of Object.entries(markdownFiles)) {
      try {
        const slug = folderFromPath(path);
        if (!slug || isHiddenFolder(slug)) continue;
        if (typeof raw !== "string") continue;

        const current = byFolder.get(slug);
        const prefersStoryFile = path.endsWith("/story.md");
        if (!current || prefersStoryFile) {
          byFolder.set(slug, { path, raw });
        }
      } catch {
        continue;
      }
    }

    for (const [slug, file] of byFolder.entries()) {
      try {
        const parsed = parseStoryMarkdown(file.raw);
        stories.push({
          slug,
          title: parsed.title || slug,
          description: parsed.description,
          link: parsed.link,
          imageSrc: imageForStory(dirFromPath(file.path)) || FALLBACK_STORY_IMAGE,
          imageMode: parsed.imageMode,
          featuredIndex: featuredIndexFromSlug(slug),
        });
      } catch {
        continue;
      }
    }

    stories.sort((a, b) => a.slug.localeCompare(b.slug));
  } catch {
    return [];
  }
  return stories;
}

let ALL_VISIBLE_STORIES: Story[] = [];
try {
  ALL_VISIBLE_STORIES = loadStories();
} catch {
  ALL_VISIBLE_STORIES = [];
}

export function getFeaturedStories() {
  try {
    return [1, 2, 3]
      .map((index) => ALL_VISIBLE_STORIES.find((story) => story.featuredIndex === index))
      .filter((story): story is Story => Boolean(story));
  } catch {
    return [];
  }
}

export function getArchiveStories() {
  try {
    const featured = getFeaturedStories();
    const rest = ALL_VISIBLE_STORIES.filter((story) => story.featuredIndex === null);
    return [...featured, ...rest];
  } catch {
    return [];
  }
}

export function StoryCover({
  story,
  alt,
  className,
}: {
  story: Story;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={story.imageSrc || FALLBACK_STORY_IMAGE}
      alt={alt ?? story.title}
      className={`${className ?? ""} ${story.imageMode === "bw" ? "grayscale" : ""}`}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK_STORY_IMAGE;
      }}
    />
  );
}

export class StoriesErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Stories stay isolated from the rest of the site.
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
