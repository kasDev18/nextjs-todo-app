# Title
`docs: rewrite README with full setup and product documentation`

## Change
Replaces the default starter README with a complete project README for Taskflow.

## Description
This update rewrites `README.md` to better document the application as a production-oriented Next.js task board. It adds clear sections for product overview, prerequisites, environment setup, database initialization, local development, Docker Compose usage, production runtime notes, project structure, quality checks, and troubleshooting.

The new documentation also clarifies important operational details such as email verification requirements, SMTP configuration, seeding behavior, and PostgreSQL setup so contributors and reviewers can understand how to run the app successfully in both local and containerized environments.

## Business Impact
- Reduces onboarding friction for engineers and reviewers by making setup and runtime expectations explicit.
- Lowers the risk of environment-related misconfiguration during development, QA, and deployment.
- Improves project maintainability by documenting core app behavior, infrastructure assumptions, and operational workflows in one place.

## User Impact
- Indirectly improves reliability by helping the team set up auth, email, database, and reminder flows correctly.
- Makes it easier to reproduce and validate user-facing features such as sign-up, email verification, task management, and reminder handling.
- Reduces the chance of broken local or staging environments delaying fixes and feature delivery for end users.
# PR Title
Strengthen home page access control and clarify signup verification flow

## Change
- Redirect unauthenticated users who land on `/` to the sign-in page while preserving the intended return path.
- Reuse a dedicated sign-in redirect helper in middleware so protected routes consistently send signed-out users to authentication.
- Run the production Docker image with `NODE_ENV=production`.
- Update the signup success toast to clearly tell users they must verify their email before signing in.

## Description
This change closes a gap where signed-out users could still hit the home page before being routed through authentication. It also improves deployment safety by ensuring the runtime container uses production mode, and it makes the signup flow clearer by telling newly registered users to verify their email.

## Business Impact
- Reduces the risk of exposing authenticated entry points to signed-out traffic.
- Improves production readiness and consistency for containerized deployments.
- Lowers avoidable support friction by setting the right expectation after account creation.

## User Impact
- Signed-out users are redirected to sign in when they access the home page.
- Protected pages continue to send unauthenticated users through the expected sign-in flow.
- New users receive clearer guidance that email verification is required before they can continue.
