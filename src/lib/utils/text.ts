export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function detectPlatform(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("leetcode.com")) return "LeetCode";
    if (host.includes("neetcode.io")) return "NeetCode";
    if (host.includes("geeksforgeeks.org")) return "GeeksforGeeks";
    if (host.includes("hackerrank.com")) return "HackerRank";
    if (host.includes("codeforces.com")) return "Codeforces";
    if (host.includes("codechef.com")) return "CodeChef";
    if (host.includes("interviewbit.com")) return "InterviewBit";
    return null;
  } catch {
    return null;
  }
}

export function titleFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const problemMatch = parsed.pathname.match(/\/problems\/([^/]+)/);
    if (problemMatch?.[1]) return titleCase(problemMatch[1]);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments.at(-1);
    if (last && last.length > 2 && !/^\d+$/.test(last)) return titleCase(decodeURIComponent(last));
    return null;
  } catch {
    return null;
  }
}

export function parseTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

export function normalizeUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function truncate(value: string | null | undefined, length = 120): string {
  if (!value) return "";
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}
