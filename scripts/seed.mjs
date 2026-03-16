import { randomUUID } from "node:crypto";
import { Client } from "pg";

const seedTemplates = [
  {
    title: "Backlog grooming for onboarding flow",
    description: "Review the signup journey and split large work items into smaller tickets.",
    project: "PROJ-135C",
    priority: "medium",
    category: "todo",
    dueInDays: 2,
  },
  {
    title: "Write validation tests for task creation",
    description: "Cover happy path and invalid payload cases for the create-task action.",
    project: "PROJ-246D",
    priority: "high",
    category: "todo",
    dueInDays: 4,
  },
  {
    title: "Draft release checklist for board MVP",
    description: "Capture final QA, migration, and rollout tasks before shipping.",
    project: "PROJ-357E",
    priority: "low",
    category: "todo",
    dueInDays: 6,
  },
  {
    title: "Review API contract for task filters",
    description: "Confirm filter params and response shape before wiring advanced board controls.",
    project: "PROJ-364F",
    priority: "medium",
    category: "todo",
    dueInDays: 3,
  },
  {
    title: "Plan accessibility pass for task board",
    description: "List keyboard, focus, and screen reader improvements needed for the board UI.",
    project: "PROJ-375G",
    priority: "high",
    category: "todo",
    dueInDays: 5,
  },
  {
    title: "Outline empty-state copy updates",
    description: "Prepare concise messaging for categories that do not have any tasks yet.",
    project: "PROJ-386H",
    priority: "low",
    category: "todo",
    dueInDays: 7,
  },
  {
    title: "Implement optimistic task refresh",
    description: "Improve the board experience so new tasks appear immediately after submit.",
    project: "PROJ-468F",
    priority: "high",
    category: "inProgress",
    dueInDays: 1,
  },
  {
    title: "Polish create-task dialog states",
    description: "Tighten loading, disabled, and error states for the modal form.",
    project: "PROJ-579G",
    priority: "medium",
    category: "inProgress",
    dueInDays: 3,
  },
  {
    title: "Connect task metrics to dashboard",
    description: "Surface task totals and completion rates in the home overview.",
    project: "PROJ-680H",
    priority: "critical",
    category: "inProgress",
    dueInDays: 5,
  },
  {
    title: "Refine task card spacing on mobile",
    description:
      "Adjust card layout so titles, descriptions, and metadata read better on small screens.",
    project: "PROJ-691J",
    priority: "medium",
    category: "inProgress",
    dueInDays: 2,
  },
  {
    title: "Add loading state for board refresh",
    description: "Show lightweight feedback while the board is refreshing after server actions.",
    project: "PROJ-702K",
    priority: "high",
    category: "inProgress",
    dueInDays: 4,
  },
  {
    title: "Verify migration against staging data",
    description: "Check that existing tasks receive valid project codes during the backfill step.",
    project: "PROJ-713L",
    priority: "critical",
    category: "inProgress",
    dueInDays: 6,
  },
  {
    title: "Ship authentication flow cleanup",
    description: "Finalize auth-related refactors and confirm the session flow works end to end.",
    project: "PROJ-791J",
    priority: "medium",
    category: "done",
    dueInDays: -1,
  },
  {
    title: "Complete database schema migration",
    description: "Apply the initial tasks migration and verify seeded records display correctly.",
    project: "PROJ-802K",
    priority: "high",
    category: "done",
    dueInDays: -2,
  },
  {
    title: "Finish board layout styling",
    description: "Wrap up spacing, cards, and responsive layout improvements for the task board.",
    project: "PROJ-913L",
    priority: "low",
    category: "done",
    dueInDays: -3,
  },
  {
    title: "Complete project field validation",
    description: "Finalize frontend and server validation rules for project code formatting.",
    project: "PROJ-924M",
    priority: "medium",
    category: "done",
    dueInDays: -4,
  },
  {
    title: "Document seed workflow for local setup",
    description:
      "Add notes for running migrations and populating example task data in development.",
    project: "PROJ-935N",
    priority: "low",
    category: "done",
    dueInDays: -5,
  },
  {
    title: "Confirm task board category counts",
    description:
      "Validate that seeded records appear in the correct columns and totals stay accurate.",
    project: "PROJ-946P",
    priority: "high",
    category: "done",
    dueInDays: -6,
  },
];

const seededProjects = seedTemplates.map((template) => template.project);

function createDueDate(dueInDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + dueInDays);

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0, 0),
  );
}

async function getOrCreateSeedUser(client) {
  const targetEmail = process.env.SEED_USER_EMAIL || "sample@email.com";
  const targetName = process.env.SEED_USER_NAME || "Sample User";

  const { rows: existingUsers } = await client.query(
    "select id, name, email from users where lower(email) = lower($1) limit 1",
    [targetEmail],
  );

  if (existingUsers.length > 0) {
    return existingUsers[0];
  }

  const user = {
    id: randomUUID(),
    name: targetName,
    email: targetEmail,
  };

  await client.query(
    `insert into users (
      id,
      name,
      email,
      email_verified,
      created_at,
      updated_at
    ) values ($1, $2, $3, $4, now(), now())`,
    [user.id, user.name, user.email, true],
  );

  return user;
}

async function seedTasksForUser(client, user) {
  await client.query(
    `delete from task_reminders
     where task_id in (
       select id from tasks where user_id = $1 and project = any($2::varchar[])
     )`,
    [user.id, seededProjects],
  );

  await client.query("delete from tasks where user_id = $1 and project = any($2::varchar[])", [
    user.id,
    seededProjects,
  ]);

  for (const template of seedTemplates) {
    const taskId = randomUUID();

    await client.query(
      `insert into tasks (
        id,
        user_id,
        title,
        description,
        project,
        created_at,
        updated_at,
        due_date,
        priority,
        category
      ) values ($1, $2, $3, $4, $5, now(), now(), $6, $7, $8)`,
      [
        taskId,
        user.id,
        template.title,
        template.description,
        template.project,
        createDueDate(template.dueInDays),
        template.priority,
        template.category,
      ],
    );

    await client.query(
      `insert into task_reminders (
        id,
        task_id,
        notif_exp_reminder_sent,
        email_exp_reminder_sent,
        email_overdue_reminder_sent,
        notif_overdue_reminder_sent,
        created_at,
        updated_at
      ) values ($1, $2, false, false, false, false, now(), now())`,
      [randomUUID(), taskId],
    );
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to your .env file before running the seed.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  await client.connect();

  try {
    const user = await getOrCreateSeedUser(client);
    await seedTasksForUser(client, user);
    console.log(`Seeded ${seedTemplates.length} tasks and reminder rows for ${user.email}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed tasks:", error.message);
  process.exit(1);
});
