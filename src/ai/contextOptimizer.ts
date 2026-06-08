import type { ContextChunk, OptimizedContext } from "../types";

export function optimizeContext(
  source: string,
  input: string,
  question: string,
  headingHint = "Context"
): OptimizedContext {
  const normalized = normalize(input);
  const sections = normalized.split(/\n{2,}/).filter(Boolean);
  const chunks: ContextChunk[] = [];

  sections.forEach((section, index) => {
    const heading = extractHeading(section) ?? headingHint;
    chunks.push({
      id: `${source}-${index + 1}`,
      heading,
      source,
      text: `[Chunk ${String(index + 1).padStart(2, "0")} | source: ${source} | heading: ${heading} | chars: ${section.length}]\n${section}`,
      score: scoreChunk(section, question, heading)
    });
  });

  const ranked = chunks.sort((left, right) => right.score - left.score);
  return {
    outline: ranked
      .slice(0, 8)
      .map((chunk) => `- ${chunk.heading} (${chunk.source})`)
      .join("\n"),
    summary: ranked
      .slice(0, 3)
      .map((chunk) => chunk.text.slice(0, 220))
      .join("\n\n"),
    chunks: ranked.slice(0, 6)
  };
}

function normalize(value: string): string {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractHeading(section: string): string | null {
  const firstLine = section.split("\n")[0]?.trim();
  if (!firstLine) {
    return null;
  }
  return firstLine.replace(/^#+\s*/, "").slice(0, 80);
}

function scoreChunk(section: string, question: string, heading: string): number {
  const queryTerms = tokenize(question);
  const contentTerms = tokenize(`${heading} ${section}`);
  const set = new Set(contentTerms);
  let score = 0;

  for (const term of queryTerms) {
    if (set.has(term)) {
      score += 2;
    }
    if (heading.toLowerCase().includes(term)) {
      score += 3;
    }
  }

  const exact = question.trim().toLowerCase();
  if (exact && section.toLowerCase().includes(exact)) {
    score += 4;
  }

  return score + Math.min(section.length / 400, 3);
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9\u00C0-\u017F]+/)
    .filter((token) => token.length > 2);
}
