import { describe, it, expect } from "vitest";
import { parseIssueRefs } from "@/lib/github/issue-linker";

describe("parseIssueRefs", () => {
  it("parses 'Fixes DEV-42' as a fixing reference", () => {
    const refs = parseIssueRefs("Fixes DEV-42: improved login flow");
    expect(refs).toHaveLength(1);
    expect(refs[0]).toMatchObject({ projectKey: "DEV", issueNumber: 42, action: "fixes" });
  });

  it("parses 'closes FE-7' case-insensitively", () => {
    const refs = parseIssueRefs("closes FE-7");
    expect(refs[0]).toMatchObject({ projectKey: "FE", issueNumber: 7, action: "fixes" });
  });

  it("parses bare 'DEV-42' as a reference (not fixes)", () => {
    const refs = parseIssueRefs("This is related to DEV-42");
    expect(refs[0]).toMatchObject({ projectKey: "DEV", issueNumber: 42, action: "references" });
  });

  it("parses '#42' using default project key", () => {
    const refs = parseIssueRefs("Fix #42", "FE");
    expect(refs[0]).toMatchObject({ projectKey: "FE", issueNumber: 42, action: "fixes" });
  });

  it("deduplicates repeated refs", () => {
    const refs = parseIssueRefs("Fixes DEV-42 and also DEV-42");
    expect(refs).toHaveLength(1);
  });

  it("parses multiple refs in one message", () => {
    const refs = parseIssueRefs("Fixes DEV-42, references BE-7");
    expect(refs).toHaveLength(2);
    expect(refs[0]).toMatchObject({ action: "fixes" });
    expect(refs[1]).toMatchObject({ action: "references" });
  });

  it("returns empty array for messages with no refs", () => {
    const refs = parseIssueRefs("chore: update dependencies");
    expect(refs).toHaveLength(0);
  });

  it("handles 'resolved' keyword", () => {
    const refs = parseIssueRefs("resolved BE-100");
    expect(refs[0]).toMatchObject({ projectKey: "BE", issueNumber: 100, action: "fixes" });
  });
});
