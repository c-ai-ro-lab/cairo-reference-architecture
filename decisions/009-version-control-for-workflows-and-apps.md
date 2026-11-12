# ADR-009: Version control for workflow exports and app-builder source

**Status:** Proposed (November 11, 2026). Not accepted. Nothing described here is connected or deployed. This record changes no production system until the director approves it.

**Drafted by:** Claude (AI), at the director's request. **Reviews pending:** ChatGPT (architecture and governance implications), Perplexity (integration security assumptions), and the director (final decision). Vendor behavior below is taken from vendor documentation as of November 11, 2026, and is listed under [Assumptions to verify](#assumptions-to-verify) where it has not yet been tested.

## Context

Two production systems have no version control today:

- **The workflow engine** (self-hosted n8n, Community Edition) runs the intake, scheduling, handoff, and approval workflows. Changes are made in its editor. Before risky edits, a single workflow is exported by hand as a JSON backup.
- **The app-builder platform** (Base44) hosts the public website and the internal operations dashboard. Changes are made in its editor and go live when published.

The director wants both connected to GitHub so changes have history and AI collaborators can work through reviewed pull requests ([multi-agent operating model](../architecture/multi-agent-operating-model.md); rules in [ADR-004](004-human-approval-gates-for-agents.md)).

The governing requirement comes from the director: **an enforceable approval process matters more than automatic synchronization.** No change may reach production without the director's approval, and that must hold in how the tools actually behave, not only in written policy.

### What the vendors document

**n8n Community Edition**
- Git-based version control and environments are not included. They are listed as paid self-hosted Business and Enterprise features ([n8n: Community Edition features](https://docs.n8n.io/deploy/host-n8n/community-edition-features/)).
- The command line can export workflows as one JSON file each (`n8n export:workflow --backup --output=<dir>`, where `--backup` sets `--all --pretty --separate`) and import them again (`n8n import:workflow --separate --input=<dir>`) ([n8n: CLI](https://docs.n8n.io/deploy/host-n8n/configure-n8n/use-the-command-line.md)).
- Imported workflows are deactivated by default. Exports keep their original IDs, so importing overwrites any workflow with a matching ID ([n8n: Backup and restore](https://docs.n8n.io/deploy/host-n8n/keep-n8n-running/backup-and-restore.md)).
- CLI exports cover workflows and credentials only. They do not include users and roles, execution history, variables, or instance settings, including the credential encryption key (same source).

**Base44 GitHub sync** ([Base44: GitHub](https://docs.base44.com/developers/app-code/local-development/github.md))
- Requires the Builder plan or higher. Each app connects to **one repository**, created at connection time. Sync works only with a default branch named `main`.
- **Outbound:** editor changes, and restores from version history, are pushed as commits **directly to `main`**. Sync cannot be paused; an app is either connected or disconnected.
- **Inbound:** changes reach Base44 when they are merged into `main`. After a merge:
  - backend functions deploy to preview and need **Publish** to reach production;
  - **entity schemas update in preview and production, with no publish step;**
  - **agents update in preview and production, with no publish step.**
- An API setting turns off *automatic* inbound sync. New commits are then pulled when someone opens the app in the editor or calls the pull endpoint. It does not affect outbound pushes ([Base44 API: toggle sync](https://docs.base44.com/api-reference/turn-automatic-github-sync-on-or-off.md)).
- The workspace chooses a shared connection (commits authored as Base44) or per-user connections (commits under each member's GitHub identity).
- Versions created before connecting cannot be restored after connecting. Reconnecting is limited (not possible if both sides have new commits, among other cases).

**GitHub** ([GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches))
- Protected branches on **private** repositories require GitHub Pro, Team, or Enterprise. They are not listed for GitHub Free.
- Push restrictions can allow named users, teams, or installed GitHub Apps to push to a protected branch. Bypass lists are available only for organization-owned repositories.
- Administrators bypass protection unless "Do not allow bypassing the above settings" is enabled.

## Requirement analysis: can Base44 two-way sync coexist with mandatory approval?

**Not fully. The two requirements conflict, and the conflict cannot be configured away in GitHub.**

1. **Base44 must push to `main` without review.** It writes directly to `main` and cannot be paused. If `main` requires an approved pull request, Base44's pushes are rejected unless the Base44 GitHub App (or, with per-user connections, each member) is allowed to bypass. What Base44 does when a push is rejected is not documented and must be tested.
2. **A bypass makes `main` unreliable as an approval record.** Any commit that arrives through the bypassing identity skips review. With a shared connection, that includes every workspace member's editor change and every change made by Base44's built-in AI, attributed to Base44 rather than to a person. GitHub can no longer show that everything on `main` was approved.
3. **A merge into `main` is a production change.** For entities and agents, approving a pull request is approving a production deployment, with no separate publish gate. A pull request that looks like "just code" can change a live data schema or a live agent.
4. **GitHub was never the approval gate for editor changes.** Changes made in the Base44 editor follow Base44's own controls: who has edit rights, and who can publish. Connecting GitHub adds a second path into production (merge to `main`). It does not put a gate in front of the first path.

**Conclusion:** if the operational apps are connected now, either `main` is protected and Base44 sync may break, or Base44 is given a bypass and GitHub no longer enforces approval. **A bypass that lets unreviewed commits reach `main`, combined with merges that update production entities and agents, undermines mandatory human approval.** This ADR therefore recommends **deferring the connection of any operational Base44 app** until the disposable-app tests below show a configuration in which every path to production passes a director approval.

## Options considered

### Workflow engine (n8n)

| # | Option | Assessment |
|---|---|---|
| N1 | **Manual one-way export to a private repository** after sanitization and validation | Recommended first step. The repository is never read by n8n, so nothing in it can change production. |
| N2 | Scheduled automated export (a workflow or cron job that commits) | Deferred until N1 has run cleanly. Adds a credential that can write to GitHub and removes the human review of each export. |
| N3 | Upgrade to a paid n8n plan with built-in Git environments | Not evaluated for cost. Would make Git a deployment path, which brings the same approval questions as Base44. |
| N4 | Third-party GitOps tools that import from Git into n8n | Rejected for now. Makes the repository a path into production and adds an unreviewed dependency. |

### App-builder platform (Base44)

| # | Option | Assessment |
|---|---|---|
| B1 | **Do not connect operational apps yet.** Test two-way sync on a disposable, non-production app. | Recommended. No production exposure while behavior is unknown. |
| B2 | Connect, protect `main` with required director approval, **no bypass** | Only acceptable if tests show Base44 behaves safely when its pushes are rejected. Expected to break or stall sync. |
| B3 | Connect, grant the Base44 app a bypass | **Rejected.** Unreviewed commits on `main`; GitHub stops enforcing approval. |
| B4 | Connect with `main` unprotected, relying on Base44 access control | **Rejected.** Anyone with repository write access, including AI collaborators, could merge a change that updates production entities or agents. |
| B5 | One-way source snapshot: periodically copy app source from Base44 into a private repository, with no sync connection | Candidate alternative if B1 tests fail. Gives history and review of what changed, while production changes stay behind Base44's Publish and edit permissions. Does not let pull requests change the app. |

## Decision (proposed)

### 1. Repository strategy

- **Private repositories** hold application source and workflow exports. `cairo-reference-architecture` stays **public and sanitized** and receives only hand-written, reviewed summaries, never exports or synced source.
- **Workflow exports:** one private repository for the workflow engine's exports.
- **Base44:** the platform's model is **one repository per app**, created by Base44, syncing on `main`. It does not provide one repository per deployment environment. Preview and production are stages inside the same app, not separate branches or repositories. The [README](../README.md)'s "private repo per environment" wording should be amended to "per app or per workflow instance" if this ADR is accepted.
- Repositories are owned by the organization, not a personal account, so access can be managed centrally and bypass lists are available.
- Each GitHub App (Base44, AI collaborators) is installed on **selected repositories only**, never on all repositories.

### 2. Workflow exports (n8n): controlled, one-way, manual first

The repository is a **version history of workflow definitions**. n8n never reads from it. Nothing committed there changes production.

**Manual export cycle**, run by the director (or by an AI collaborator under supervision, with the director approving the commit):

1. **Export** all workflows with the CLI inside the n8n container to a working directory on the host. The working directory is outside any Git checkout and is deleted after the cycle.
2. **Sanitize** each file:
   - **Pinned data** (`pinData`): remove. It is test or production input saved in the editor and can hold personal information.
   - **Workflow static data** (`staticData`): remove. Workflows can keep records between runs (for example, rate-limit or deduplication records) that may contain personal information.
   - **Hard-coded values in nodes:** search Code, HTTP Request, Set, and sticky-note content for emails, phone numbers, tokens, keys, and passwords. A secret found here is not redacted and committed: the workflow is fixed to use a stored credential, and the secret is rotated.
   - **Credential metadata:** nodes reference credentials by ID and name. These are not secrets and are kept, because restoration needs them, but they reveal which services are connected. This is one reason the repository is private.
   - **Webhook paths and IDs:** kept, because restoration needs them. They are not secrets, but they identify public entry points. Every webhook must still enforce its own authentication; a private path is not a control. If the repository is ever exposed, webhook paths are treated as disclosed and reviewed.
3. **Validate** before committing:
   - every file parses as JSON, and the file count matches the number of workflows in the instance;
   - no file contains a non-empty `pinData` or `staticData`;
   - a secret scan (for example gitleaks, already used on the public repository) passes;
   - a personal-information pattern search (emails, phone numbers) returns only expected business addresses;
   - the director reviews the diff against the previous export.
4. **Commit** to a branch and open a pull request. The director approves the merge. A merge here is a version-control action only.

**Never committed:** credential exports of any kind (`export:credentials`), especially `--decrypted` exports, which are plain text; the instance's `.n8n` folder, database, or encryption key; execution data; environment files.

**Scheduled automation** is considered only after at least three consecutive manual cycles with no sanitization findings. It must:
- run the same sanitization and validation and **fail closed**, committing nothing if any check fails;
- push to a branch and open a pull request, never push to `main`;
- authenticate with a credential limited to that one repository, stored in the password manager, rotated on a schedule.

**Restoration from the repository** is a production change and needs director approval:
1. Export the current state first, so the restore can be undone.
2. Import into a **non-production** n8n instance first and check that it loads.
3. Only then import into production. Imports overwrite workflows with matching IDs and arrive **deactivated**, so importing over a live workflow can take it offline until it is reactivated.
4. Re-link credentials if needed. Static data, pinned test data, and execution history are not restored, because they were never exported.
5. The director activates the workflow.

**Version control is not disaster recovery.** The repository can restore workflow *definitions* onto a working n8n instance. It cannot rebuild the instance. A complete recovery also needs the database, the `.n8n` folder including the credential encryption key, credentials, users, variables, execution history if wanted, and the deployment configuration (container definitions, tunnel, proxy allowlist, and zero-trust access). That backup is separate, encrypted, stored off the host, and **never in GitHub**. Its design and a tested restore are a separate gap, recorded in [build status](../architecture/build-status.md) when this ADR is accepted.

### 3. App-builder platform (Base44): test before connecting anything operational

- **No operational app is connected** (not the public website, not the operations dashboard) until the director accepts a configuration based on the test results below.
- Testing uses a **disposable app** created for the purpose, with no real data, connected to a **disposable private repository**. Both are deleted after testing.
- If no tested configuration keeps every path to production behind director approval, the recommendation becomes **B5** (one-way snapshot) or no connection.

### 4. Which actions change production

| Action | System | Effect |
|---|---|---|
| Export workflows; commit, open PR, or merge in the exports repository | n8n + GitHub | **Version control only** |
| Import a workflow into the production instance | n8n | **Production change** (overwrites by ID, deactivates the imported workflow) |
| Activate or deactivate a workflow | n8n | **Production change** |
| Save a change in the Base44 editor (connected app) | Base44 | Changes preview; pushes a commit to `main`. Production effect depends on resource type and Publish (to verify) |
| Merge into `main` (connected app): entity schema or agent change | Base44 + GitHub | **Production change, immediate, no publish step** |
| Merge into `main` (connected app): backend function change | Base44 + GitHub | Preview only, until Publish |
| Publish in Base44 | Base44 | **Production change** |
| Restore a version in Base44 (connected app) | Base44 | Pushes a commit to `main`; production effect as above |
| Revert a merged change in GitHub (connected app) | Base44 + GitHub | **Production change** (a new merge to `main`) |
| Connect or disconnect an app, change sync settings | Base44 | **Configuration change**, director only |
| Change repository access, branch protection, or bypass lists | GitHub | **Control change**, director only |
| Merge into `cairo-reference-architecture` | GitHub | **Public publication** (no production effect, but public disclosure) |

## Security risks

| Risk | Mitigation |
|---|---|
| Personal information in exports (pinned data, static data, hard-coded test values) | Strip and validate before every commit; private repository; personal-information search |
| Secrets committed by mistake | Secret scan before commit and in CI; secrets live only in credential stores; rotate on any finding. GitHub's built-in secret scanning for private repositories may need a paid add-on, so do not rely on it alone |
| Repository exposure reveals webhook paths, connected services, and prompts | Private repository; minimal collaborators; two-factor authentication required; forking of private repositories disabled; webhooks keep their own authentication |
| Merge to `main` silently changes production entities or agents (Base44) | Defer operational connection; if ever connected, reviewers treat every merge as a production deployment |
| A bypass identity commits unreviewed changes to `main` | Bypass rejected (option B3) |
| Third-party GitHub Apps with broad repository access | Install on selected repositories only; review installed apps and their permissions when access changes |
| AI collaborators with write access merging their own work | Branch protection with required director approval and admin enforcement; AI branches limited to their prefixes (`claude/`, `chatgpt/`) |
| Branch protection unavailable on the organization's plan for private repositories | Check the plan before creating private repositories; without protection, no repository may be a path into production |
| Restore overwrites a live workflow | Export first; restore to non-production first; director approves and activates |

## Rollback and recovery limitations

- **Base44 entity schemas:** reverting a schema change in Git applies a new schema. It does not bring back data that was dropped or altered by the original change.
- **Base44 history:** versions from before the connection cannot be restored after connecting. Reconnecting after a disconnect is not always possible. Sync cannot be paused, only disconnected.
- **Base44 conflicts:** Base44 does not resolve conflicts automatically. Its AI conflict resolution is itself an unreviewed change.
- **Workflow exports** are point-in-time definitions. They do not restore credentials, static data, execution history, users, or variables, and an import deactivates the restored workflow.
- **A GitHub revert is not an undo.** It is a new change that goes through the same paths to production.

## Test procedures

### Workflow exports (n8n), in a dry run before the first real commit

1. Run the export into a scratch directory; confirm one file per workflow and the count matches the instance.
2. Insert a known fake email into a test workflow's pinned data; confirm sanitization removes it and validation then passes.
3. Insert a known fake token into a test Code node; confirm the secret scan fails the cycle.
4. Import the sanitized set into a **non-production** instance; confirm the workflows load, arrive deactivated, and show which credentials need re-linking.
5. Record method, date, operator, and results in [build status](../architecture/build-status.md) (lifecycle and assurance stay separate).

### Base44 two-way sync, on a disposable app and repository only

| # | Test | What it shows |
|---|---|---|
| T1 | Connect the disposable app to an unprotected disposable repo; edit in the editor | What a Base44 commit contains and how it is attributed (shared vs per-user) |
| T2 | Protect `main` (required approval, admins enforced, no bypass); edit in the editor | Whether the push is rejected, and what Base44 does next: error, retry, silent divergence, or blocked editor |
| T3 | Under T2, merge an approved PR that changes a backend function | Function reaches preview only; production unchanged until Publish |
| T4 | Under T2, merge an approved PR that changes an entity schema | Whether production changes immediately, and what happens to existing records |
| T5 | Under T2, merge an approved PR that changes an agent | Whether production changes immediately |
| T6 | Turn off automatic inbound sync; merge a PR; open the editor | Whether opening the editor applies unapproved-for-production changes |
| T7 | Create a conflicting edit on both sides | How conflicts appear; whether AI resolution changes anything without review |
| T8 | Restore an earlier version in Base44 | What is pushed to `main` |
| T9 | Disconnect, then attempt to reconnect | The documented reconnection limits in practice |
| T10 | Check whether the Base44 GitHub App can push to any repository it was not installed on | Scope of the app's access |

Each test records the date, who ran it, the configuration, and the observed result. A test that was not run is reported as not run.

## Decisions requiring the director's approval

1. Accept, amend, or reject this ADR.
2. Confirm the GitHub organization's plan supports branch protection on private repositories, or decide to upgrade.
3. Create the private workflow-exports repository, and decide who has access (people and AI collaborators, read or write).
4. Approve the sanitization rules and the validation checklist.
5. Approve each workflow-export pull request (version control only).
6. Approve any restore into production, and every workflow activation that follows it.
7. Approve moving from manual to scheduled exports, and the credential the schedule uses.
8. Create the disposable Base44 app and repository, and install the Base44 GitHub App on that repository only.
9. Review the Base44 test results and choose among B2, B5, or no connection for each operational app.
10. Any connection of an operational Base44 app, any sync setting change, and any branch-protection or bypass change.
11. The design of the separate n8n disaster-recovery backup.

## Assumptions to verify

- Exported workflow JSON includes `pinData` and `staticData` fields. Expected from how n8n stores workflows, not stated in the CLI documentation; confirmed in dry-run step 2.
- Base44 behavior when its push to a protected `main` is rejected (T2). Not documented.
- Whether entity and agent changes made in the Base44 editor, before any GitHub connection, already reach production without Publish. This affects how much GitHub would change the current approval model.
- The GitHub organization's current plan.

## Consequences

- Workflow definitions gain history and review with no new path into production.
- The operational Base44 apps stay unconnected for now, so pull requests cannot change them. Changes continue through the Base44 editor and Publish under the director's control.
- AI collaborators can review workflow exports through pull requests, but cannot change production through GitHub.
- Disaster recovery for the workflow engine remains an open gap until its separate backup is designed and a restore is tested.
- Maps to NIST AI RMF *Govern* (accountability for changes, access control) and *Manage* (change management, recovery); see the [governance mapping](../governance/nist-ai-rmf-mapping.md).
