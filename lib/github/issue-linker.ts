export type LinkedIssueRef = {
  projectKey: string;
  issueNumber: number;
  action: "fixes" | "references";
};

const CLOSING_KEYWORDS = /\b(?:fix(?:es|ed)?|close[sd]?|resolve[sd]?)\b/i;

export function parseIssueRefs(text: string, defaultProjectKey?: string): LinkedIssueRef[] {
  const refs: LinkedIssueRef[] = [];
  const seen = new Set<string>();

  // Match "fixes DEV-42", "closes #42", "DEV-42", "#42"
  const closingRegex = new RegExp(
    `(${CLOSING_KEYWORDS.source}\\s+)?(?:([A-Z]{1,6})-(\\d+)|#(\\d+))`,
    "gi"
  );

  let match: RegExpExecArray | null;
  while ((match = closingRegex.exec(text)) !== null) {
    const keyword = match[1];
    const projectKey = match[2] ?? defaultProjectKey;
    const numberStr = match[3] ?? match[4];

    if (!projectKey || !numberStr) continue;

    const issueNumber = parseInt(numberStr, 10);
    const key = `${projectKey}-${issueNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);

    refs.push({
      projectKey: projectKey.toUpperCase(),
      issueNumber,
      action: keyword ? "fixes" : "references",
    });
  }

  return refs;
}
