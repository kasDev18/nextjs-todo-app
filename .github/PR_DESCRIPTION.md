# feat: Add PR Template

## Description

Adds a standardized pull request template (`.github/PR_TEMPLATE.md`) to the repository. The template provides a consistent structure for all future pull requests, including sections for describing changes, before/after previews, miscellaneous notes, and a testing checklist.

## Business Impact

- **Improved code review efficiency**: A standardized PR format reduces back-and-forth by ensuring authors provide sufficient context upfront.
- **Better documentation trail**: Consistent PR descriptions create a clearer audit trail of what changed and why, aiding future debugging and onboarding.
- **Enforced quality standards**: The built-in checklist reminds contributors to verify their changes locally before requesting review.

## User Impact

- **Contributors** get a guided structure when opening PRs, reducing the guesswork of what information to include.
- **Reviewers** receive consistently formatted PRs with relevant context, previews, and confirmation of local testing, leading to faster and more thorough reviews.
- **New team members** benefit from a lower barrier to contribution, as the template clearly communicates project expectations.

## Changes

- Added `.github/PR_TEMPLATE.md` with the following sections:
  - **What is this for?** — Problem statement and solution description.
  - **Preview** — Before/after comparison table for visual changes.
  - **Other** — Space for miscellaneous notes, refactors, or chore tasks.
  - **Checklist** — Local testing verification.
