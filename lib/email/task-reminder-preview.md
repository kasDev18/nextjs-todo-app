# Task Reminder Email Preview

Use `lib/email/task-reminder-preview.html` to preview the reminder email in a browser.

The preview includes both reminder states:

- `Due soon` for tasks inside the nearly expired window
- `Overdue` for tasks that have already passed their deadline

Sample values used in the preview:

- Recipient names: `Alex Johnson`, `Maya Patel`
- Projects: `TSK-2048`, `TSK-1182`
- Destinations: `http://localhost:3000/tasks/task-123/edit`, `http://localhost:3000/tasks/task-456/edit`

Runtime email template source:

- `lib/email/task-reminder.ts`
