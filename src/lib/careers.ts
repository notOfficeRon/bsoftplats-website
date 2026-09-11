export type Opening = {
  slug: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
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
  const responsibilities: string[] = [];
  const requirements: string[] = [];
  const preferred: string[] = [];

  try {
    const text = safeString(raw).replace(/\r\n/g, "\n");
    let section: "meta" | "description" | "responsibilities" | "requirements" | "preferred" = "meta";

    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (/^responsibilities\s*:/i.test(trimmed)) {
        section = "responsibilities";
        continue;
      }
      if (/^requirements\s*:/i.test(trimmed)) {
        section = "requirements";
        continue;
      }
      if (/^(nice to have|preferred)\s*:/i.test(trimmed)) {
        section = "preferred";
        continue;
      }

      const bullet = trimmed.startsWith("-") ? trimmed.replace(/^-+\s*/, "").trim() : "";
      if (section === "responsibilities" && bullet) {
        responsibilities.push(bullet);
        continue;
      }
      if (section === "requirements" && bullet) {
        requirements.push(bullet);
        continue;
      }
      if (section === "preferred" && bullet) {
        preferred.push(bullet);
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
        if (!description.value) section = "description";
        continue;
      }
      if (section === "description") {
        description.value = description.value ? `${description.value} ${trimmed}` : trimmed;
      }
    }
  } catch {
    // keep empty fields
  }

  return {
    title: title.value,
    description: description.value,
    responsibilities,
    requirements,
    preferred,
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
          responsibilities: parsed.responsibilities,
          requirements: parsed.requirements,
          preferred: parsed.preferred,
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
