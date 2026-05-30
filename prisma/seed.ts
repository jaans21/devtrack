import { PrismaClient, WorkspaceRole, IssueStatus, IssuePriority, IssueType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Chen",
      passwordHash,
      image: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Smith",
      passwordHash,
      image: "https://avatars.githubusercontent.com/u/2?v=4",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      email: "carol@example.com",
      name: "Carol Davis",
      passwordHash,
      image: "https://avatars.githubusercontent.com/u/3?v=4",
    },
  });

  console.log("✅ Created users");

  // Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme",
      ownerId: alice.id,
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: alice.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: alice.id, role: WorkspaceRole.OWNER },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: bob.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: bob.id, role: WorkspaceRole.MEMBER },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: carol.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: carol.id, role: WorkspaceRole.MEMBER },
  });

  console.log("✅ Created workspace and members");

  // Labels
  const labelData = [
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#3b82f6" },
    { name: "Enhancement", color: "#8b5cf6" },
    { name: "Documentation", color: "#f59e0b" },
    { name: "Tech Debt", color: "#6b7280" },
  ];

  const labels = await Promise.all(
    labelData.map((l) =>
      prisma.label.create({ data: { ...l, workspaceId: workspace.id } })
    )
  );

  console.log("✅ Created labels");

  // Projects
  const frontendProject = await prisma.project.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: "FE" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Frontend",
      key: "FE",
      description: "The customer-facing Next.js application",
      color: "#3b82f6",
    },
  });

  const backendProject = await prisma.project.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: "BE" } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Backend",
      key: "BE",
      description: "API services and infrastructure",
      color: "#10b981",
    },
  });

  console.log("✅ Created projects");

  // Sprints
  const now = new Date();
  const sprintEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const feSprint = await prisma.sprint.create({
    data: {
      projectId: frontendProject.id,
      name: "Sprint 1",
      goal: "Launch the initial dashboard and auth flow",
      status: "ACTIVE",
      startDate: now,
      endDate: sprintEnd,
    },
  });

  const beSprint = await prisma.sprint.create({
    data: {
      projectId: backendProject.id,
      name: "Sprint 1",
      goal: "Set up core API endpoints and database schema",
      status: "ACTIVE",
      startDate: now,
      endDate: sprintEnd,
    },
  });

  console.log("✅ Created sprints");

  // Issues — Frontend
  const feIssues = [
    {
      title: "Set up Next.js 15 project with TypeScript",
      status: IssueStatus.DONE,
      priority: IssuePriority.HIGH,
      type: IssueType.TASK,
      storyPoints: 2,
      assigneeId: alice.id,
    },
    {
      title: "Implement GitHub OAuth login flow",
      status: IssueStatus.DONE,
      priority: IssuePriority.URGENT,
      type: IssueType.FEATURE,
      storyPoints: 5,
      assigneeId: alice.id,
    },
    {
      title: "Build sidebar navigation component",
      status: IssueStatus.IN_PROGRESS,
      priority: IssuePriority.HIGH,
      type: IssueType.TASK,
      storyPoints: 3,
      assigneeId: bob.id,
    },
    {
      title: "Create kanban board with drag-and-drop",
      status: IssueStatus.IN_PROGRESS,
      priority: IssuePriority.HIGH,
      type: IssueType.FEATURE,
      storyPoints: 8,
      assigneeId: alice.id,
    },
    {
      title: "Dark mode support",
      status: IssueStatus.TODO,
      priority: IssuePriority.MEDIUM,
      type: IssueType.FEATURE,
      storyPoints: 3,
      assigneeId: carol.id,
    },
    {
      title: "Fix avatar image loading on slow connections",
      status: IssueStatus.TODO,
      priority: IssuePriority.LOW,
      type: IssueType.BUG,
      storyPoints: 1,
      assigneeId: bob.id,
    },
    {
      title: "Markdown editor for issue descriptions",
      status: IssueStatus.IN_REVIEW,
      priority: IssuePriority.MEDIUM,
      type: IssueType.FEATURE,
      storyPoints: 5,
      assigneeId: carol.id,
    },
    {
      title: "Sprint burndown chart component",
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.MEDIUM,
      type: IssueType.FEATURE,
      storyPoints: 5,
      assigneeId: undefined,
    },
    {
      title: "Responsive mobile layout",
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.LOW,
      type: IssueType.IMPROVEMENT,
      storyPoints: 8,
      assigneeId: undefined,
    },
    {
      title: "Add keyboard shortcuts for common actions",
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.LOW,
      type: IssueType.IMPROVEMENT,
      storyPoints: 3,
      assigneeId: undefined,
    },
  ];

  for (let i = 0; i < feIssues.length; i++) {
    const issue = feIssues[i];
    if (!issue) continue;
    await prisma.issue.create({
      data: {
        number: i + 1,
        projectId: frontendProject.id,
        sprintId: i < 7 ? feSprint.id : undefined,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        type: issue.type,
        storyPoints: issue.storyPoints,
        assigneeId: issue.assigneeId,
        reporterId: alice.id,
        position: (i + 1) * 1000,
      },
    });
  }

  // Issues — Backend
  const beIssues = [
    {
      title: "Design Prisma schema for all models",
      status: IssueStatus.DONE,
      priority: IssuePriority.URGENT,
      type: IssueType.TASK,
      storyPoints: 5,
      assigneeId: alice.id,
    },
    {
      title: "GitHub webhook HMAC verification",
      status: IssueStatus.IN_PROGRESS,
      priority: IssuePriority.HIGH,
      type: IssueType.TASK,
      storyPoints: 3,
      assigneeId: bob.id,
    },
    {
      title: "SSE connection manager for real-time updates",
      status: IssueStatus.TODO,
      priority: IssuePriority.HIGH,
      type: IssueType.FEATURE,
      storyPoints: 5,
      assigneeId: alice.id,
    },
    {
      title: "Time entry API endpoints",
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.MEDIUM,
      type: IssueType.FEATURE,
      storyPoints: 3,
      assigneeId: carol.id,
    },
    {
      title: "Rate limiting on API routes",
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.MEDIUM,
      type: IssueType.IMPROVEMENT,
      storyPoints: 2,
      assigneeId: undefined,
    },
  ];

  for (let i = 0; i < beIssues.length; i++) {
    const issue = beIssues[i];
    if (!issue) continue;
    await prisma.issue.create({
      data: {
        number: i + 1,
        projectId: backendProject.id,
        sprintId: i < 3 ? beSprint.id : undefined,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        type: issue.type,
        storyPoints: issue.storyPoints,
        assigneeId: issue.assigneeId,
        reporterId: alice.id,
        position: (i + 1) * 1000,
      },
    });
  }

  console.log("✅ Created issues");

  // Comments
  const firstFeIssue = await prisma.issue.findFirst({
    where: { projectId: frontendProject.id, number: 3 },
  });

  if (firstFeIssue) {
    await prisma.comment.createMany({
      data: [
        {
          issueId: firstFeIssue.id,
          authorId: alice.id,
          body: "The sidebar should collapse on mobile screens. Using a Sheet component from shadcn/ui would work well here.",
        },
        {
          issueId: firstFeIssue.id,
          authorId: bob.id,
          body: "Good idea. I'll add a toggle button in the header for mobile. Should we persist the collapsed state in localStorage?",
        },
        {
          issueId: firstFeIssue.id,
          authorId: alice.id,
          body: "Yes, use Zustand to store it — we have a `ui-store` for exactly this kind of ephemeral UI state.",
        },
      ],
    });
  }

  console.log("✅ Created comments");

  // Time entries
  const inProgressIssue = await prisma.issue.findFirst({
    where: { projectId: frontendProject.id, number: 3 },
  });

  if (inProgressIssue) {
    await prisma.timeEntry.create({
      data: {
        issueId: inProgressIssue.id,
        userId: bob.id,
        description: "Initial sidebar component structure",
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        stoppedAt: new Date(),
        duration: 7200,
      },
    });
  }

  console.log("✅ Created time entries");

  // Add labels to some issues
  const bugLabel = labels.find((l) => l.name === "Bug");
  const featureLabel = labels.find((l) => l.name === "Feature");

  const bugIssue = await prisma.issue.findFirst({
    where: { projectId: frontendProject.id, number: 6 },
  });

  if (bugIssue && bugLabel) {
    await prisma.issueLabel.create({
      data: { issueId: bugIssue.id, labelId: bugLabel.id },
    });
  }

  const kanbanIssue = await prisma.issue.findFirst({
    where: { projectId: frontendProject.id, number: 4 },
  });

  if (kanbanIssue && featureLabel) {
    await prisma.issueLabel.create({
      data: { issueId: kanbanIssue.id, labelId: featureLabel.id },
    });
  }

  console.log("✅ Applied labels to issues");

  console.log("\n🎉 Seed complete!");
  console.log("\nTest credentials:");
  console.log("  alice@example.com / Password123! (Owner)");
  console.log("  bob@example.com / Password123! (Member)");
  console.log("  carol@example.com / Password123! (Member)");
  console.log("\nWorkspace slug: acme");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
