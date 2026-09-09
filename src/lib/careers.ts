export type Opening = {
  slug: string;
  title: string;
  description: string;
  requirements: string[];
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function folderFromPath(filePath: string) {
  try {
    const parts = filePath.split("/");
    return parts[parts.length - 2] ?? "";
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

function parseOpeningMarkdown(raw: unknown) {
  const title = { value: "" };
  const description = { value: "" };
  const requirements: string[] = [];

  try {
    const text = safeString(raw).replace(/\r\n/g, "\n");
    let section: "meta" | "requirements" = "meta";

    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (/^requirements\s*:/i.test(trimmed)) {
        section = "requirements";
        const rest = trimmed.replace(/^requirements\s*:/i, "").trim();
        if (rest.startsWith("-")) {
          const item = rest.replace(/^-+\s*/, "").trim();
          if (item) requirements.push(item);
        }
        continue;
      }

      if (section === "requirements") {
        if (trimmed.startsWith("-")) {
          const item = trimmed.replace(/^-+\s*/, "").trim();
          if (item) requirements.push(item);
        }
        continue;
      }

      const titleMatch = /^title\s*:\s*(.*)$/i.exec(trimmed);
      if (titleMatch) {
        title.value = titleMatch[1].trim();
        continue;
      }
      const descriptionMatch = /^description\s*:\s*(.*)$/i.exec(trimmed);
      if (descriptionMatch) {
        description.value = descriptionMatch[1].trim();
      }
    }
  } catch {
    // keep empty fields
  }

  return {
    title: title.value,
    description: description.value,
    requirements,
  };
}

function readMarkdownFiles() {
  try {
    return import.meta.glob("../../careers/**/*.md", {
      eager: true,
      query: "?raw",
      import: "default",
    }) as Record<string, string>;
  } catch {
    return {};
  }
}

const markdownFiles = readMarkdownFiles();

function loadOpenings(): Opening[] {
  const openings: Opening[] = [];
  try {
    const byFolder = new Map<string, { path: string; raw: string }>();

    for (const [path, raw] of Object.entries(markdownFiles)) {
      try {
        const slug = folderFromPath(path);
        if (!slug || isHiddenFolder(slug)) continue;
        if (typeof raw !== "string") continue;
        const prefersOpeningFile = path.endsWith("/opening.md");
        const current = byFolder.get(slug);
        if (!current || prefersOpeningFile) {
          byFolder.set(slug, { path, raw });
        }
      } catch {
        continue;
      }
    }

    for (const [slug, file] of byFolder.entries()) {
      try {
        const parsed = parseOpeningMarkdown(file.raw);
        openings.push({
          slug,
          title: parsed.title || slug,
          description: parsed.description,
          requirements: parsed.requirements,
        });
      } catch {
        continue;
      }
    }

    openings.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
  return openings;
}

let ALL_OPENINGS: Opening[] = [];
try {
  ALL_OPENINGS = loadOpenings();
} catch {
  ALL_OPENINGS = [];
}

export function getOpenings() {
  try {
    return ALL_OPENINGS;
  } catch {
    return [];
  }
}
