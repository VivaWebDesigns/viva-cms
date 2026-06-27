# Codex Agents

These project operating notes are standing rules for working in this repository unless the user explicitly overrides them.

## Project Operating Notes

1. No unpublished work should sit in the worktree.
   If changes are real, approved, and part of completed work, they should be committed and pushed. Do not leave finished work hanging locally.

2. Always inspect the worktree before claiming a task is done.
   Run `git status` and review staged/unstaged changes. Understand what changed before summarizing.

3. Push to `main` for direct production-bound maintenance unless the user explicitly asks for a branch or PR.
   If you are unsure whether a branch/PR is required, ask before doing Git operations.

4. Do not leave dirty work uncommitted after a completed task.
   If something is intentionally not committed, say so clearly and explain why.

5. Before committing/pushing, verify when practical.
   Use the project's available checks, usually:
   - typecheck
   - tests
   - build
   - lint

   If a check cannot be run, explain why.

6. Do not casually revert user or prior work.
   Inspect existing changes, work with them, and only revert/remove them if they are clearly part of the current task or the user explicitly approves it.

7. For Railway/local database issues:
   `DATABASE_URL` may be a local blocker because Railway can inject a private internal Postgres hostname that does not resolve outside Railway. If local route curl verification fails because of this, report it clearly and do not pretend the route was locally verified.

8. For old/legacy URLs:
   Handle redirects, 404s, and 410s server-side before the React/app-shell fallback. Do not let retired URLs return a soft `200` app shell or client-side NotFound page.

9. For inherited starter modules:
   Prefer deleting active retired code over hiding, gating, disabling, or leaving it as future functionality. Do not drop database tables or rewrite historical migrations without explicit approval.

10. Final reports should include:
    - what changed
    - exact files/areas touched when useful
    - verification commands and results
    - remaining risks
    - anything that could not be locally verified
    - Git status/commit/push status when relevant

11. Trust/process rule:
    There should be no mystery unpublished work sitting in the tree. Inspect, commit, push, and report clearly.
