import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taskflow - Task Board",
  description: "Track work across To Do, In Progress, and Done lanes with a focused task board.",
};

export type BoardColumn = {
  title: string;
  category: "todo" | "progress" | "done";
  count: number;
  tasks: Task[];
};

export type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  project: string;
};

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    title: "To Do",
    category: "todo",
    count: 9,
    tasks: [
      {
        id: 1,
        title: "Redesign onboarding flow",
        description: "Refresh the first-run journey to improve activation and reduce friction.",
        dueDate: "Jun 18",
        project: "PROJ-1234",
      },
      {
        id: 2,
        title: "API rate limiting",
        description: "Protect public endpoints with safer request thresholds and retry behavior.",
        dueDate: "Jun 20",
        project: "PROJ-5678",
      },
      {
        id: 3,
        title: "Customer feedback digest",
        description: "Summarize the latest user issues and feature requests for triage.",
        dueDate: "Jun 21",
        project: "PROJ-9101",
      },
      {
        id: 4,
        title: "Billing modal polish",
        description: "Tighten copy, spacing, and states for the upgrade confirmation modal.",
        dueDate: "Jun 22",
        project: "PROJ-1213",
      },
      {
        id: 5,
        title: "Search indexing cleanup",
        description: "Remove stale records and improve sync reliability for indexed content.",
        dueDate: "Jun 23",
        project: "PROJ-1415",
      },
      {
        id: 6,
        title: "Accessibility pass",
        description: "Audit keyboard, contrast, and screen reader support across core flows.",
        dueDate: "Jun 24",
        project: "PROJ-1617",
      },
      {
        id: 7,
        title: "Empty state illustrations",
        description: "Create lightweight visuals for zero-data states in dashboard views.",
        dueDate: "Jun 25",
        project: "PROJ-1819",
      },
    ],
  },
  {
    title: "In Progress",
    category: "progress",
    count: 3,
    tasks: [
      {
        id: 1,
        title: "Auth refactor with SSO support",
        description: "Restructure sign-in flows to support enterprise SSO providers.",
        dueDate: "Jun 14",
        project: "PROJ-2021",
      },
      {
        id: 2,
        title: "Component library v2 tokens",
        description: "Define the next set of spacing, color, and typography tokens.",
        dueDate: "Jun 15",
        project: "PROJ-2223",
      },
      {
        id: 3,
        title: "Component library v2 tokens",
        description: "Document reusable token patterns for current UI foundations.",
        dueDate: "Jun 15",
        project: "PROJ-2425",
      },
      {
        id: 4,
        title: "Component library v2 tokens",
        description: "Review component mappings before the token rollout is finalized.",
        dueDate: "Jun 15",
        project: "PROJ-2627",
      },
      {
        id: 5,
        title: "Component library v2 tokens",
        description: "Validate token naming so engineering adoption stays consistent.",
        dueDate: "Jun 15",
        project: "PROJ-2829",
      },
    ],
  },
  {
    title: "Done",
    category: "done",
    count: 8,
    tasks: [
      {
        id: 1,
        title: "Regression test suite",
        description: "Expanded automated coverage for critical user journeys and bug fixes.",
        dueDate: "Jun 10",
        project: "PROJ-3031",
      },
      {
        id: 2,
        title: "DB migration scripts",
        description: "Prepared versioned schema changes for the next production release.",
        dueDate: "Jun 9",
        project: "PROJ-3233",
      },
      {
        id: 3,
        title: "Analytics dashboard redesign",
        description: "Modernized the reporting experience with clearer data hierarchy.",
        dueDate: "Jun 11",
        project: "PROJ-3435",
      },
      {
        id: 4,
        title: "User profile page overhaul",
        description: "Reworked profile settings with cleaner sections and stronger hierarchy.",
        dueDate: "Jun 12",
        project: "PROJ-3637",
      },
      {
        id: 5,
        title: "Settings page redesign",
        description: "Simplified preferences screens for better discoverability and scanning.",
        dueDate: "Jun 13",
        project: "PROJ-3839",
      },
      {
        id: 6,
        title: "Homepage redesign",
        description: "Shipped the new landing page layout and supporting visual updates.",
        dueDate: "Jun 14",
        project: "PROJ-4041",
      },
    ],
  },
];
