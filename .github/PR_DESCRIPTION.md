# feat: Task Management Page

## Description

Builds the core task board UI — a three-column Kanban-style layout (To Do, In Progress, Done) that serves as the authenticated home page. Each column renders a scrollable list of task cards with title, description, project identifier, and due date. The board data is driven by a typed constants file with placeholder tasks, and a new `ScrollArea` Radix UI component enables smooth vertical scrolling within each column. The page is fully responsive and theme-aware across light and dark modes.

## Changes

### New files
- **`app/(home)/constants.ts`** — Typed constants defining `BoardColumn`, `Task`, and the `BOARD_COLUMNS` array with three columns (To Do: 7 tasks, In Progress: 5 tasks, Done: 6 tasks). Also exports page `metadata` for the task board.
- **`app/(home)/styles.module.css`** — Scoped styles for the board layout, column containers, category-colored title rows (default/accent/green), task cards, scroll area customization (thumb, scrollbar width), and responsive sizing.
- **`components/ui/scroll-area.tsx`** — `ScrollArea` and `ScrollBar` components built on Radix UI `ScrollAreaPrimitive`, with accessible focus ring, custom thumb styling, and vertical/horizontal orientation support.

### Updated files
- **`app/(home)/page.tsx`** — Replaced the placeholder `<div>Home</div>` with the full task board: iterates `BOARD_COLUMNS`, renders column headers with category badges and task counts, a separator, and a scrollable list of task cards with footer metadata.
- **`app/globals.css`** — Minor formatting cleanup: normalized `rgba` alpha values from `0.10` to `0.1`.

## Business Impact

- **Delivers the core product surface** — The task board is the primary view users interact with after signing in. Having it in place makes the application tangible and demonstrates the product's value proposition for stakeholders and early testers.
- **Establishes the data model contract** — The typed `BoardColumn` and `Task` interfaces in the constants file define the shape that the future backend API and database schema will serve, aligning frontend and backend development early.
- **Reusable scroll infrastructure** — The `ScrollArea` component is a general-purpose building block that can be used across the app (sidebars, modals, dropdowns) without additional dependency work.

## User Impact

- **Visual task overview at a glance** — Users see all their work organized into three clear swim lanes with color-coded headers, making it easy to understand workload distribution without clicking into anything.
- **Smooth scrolling within columns** — Long task lists scroll independently inside each column with a styled scrollbar, keeping the board header and other columns visible at all times.
- **Responsive and theme-aware** — The board adapts from a stacked mobile layout to a three-column grid on larger screens, and renders correctly in both light and dark themes with appropriate card shadows, borders, and text colors.
