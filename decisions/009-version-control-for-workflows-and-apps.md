# ADR-009: Version control for workflow exports and app-builder source

**Status:** Proposed (November 11, 2026; revision 2). Not accepted. Nothing described here is connected or deployed. Accepting this ADR records an architecture direction. It does **not** authorize any connection, repository, permission, or production change. Each of those needs its own director approval (see [Decisions requiring the director's approval](#decisions-requiring-the-directors-approval)).

**Drafted by:** Claude (AI), at the director's request. **Reviews so far:**
- ChatGPT (AI): architecture and governance review, posted on the pull request on November 11, 2026.
- Perplexity (AI): research report on the vendor assumptions, shared with the director.

Both are AI reviews, not independent evaluations. **Final decision:** the director.

## How to read this record

Every factual claim carries one of four labels:

| Label | Meaning |
|---|---|
| **[V]** | Vendor-documented behavior, with a link to the vendor's documentation as read on November 11, 2026. Not tested by CAIRO. |
| **[O]** | Observed in CAIRO's own environment, with how it was observed |
| **[U]** | Untested assumption. Must not be relied on until a listed test settles it |
| **[P]** | Proposed control. Does not exist yet |

Vendor behavior can change. A [V] claim is re-checked before any test that depends on it.

## Context

Two production systems have no version control today:

- **The workflow engine** (self-hosted n8n, Community Edition) runs the intake, scheduling, handoff, and approval workflows.
- **The app-builder platform** (Base44) hosts the public website and an internal operations dashboard.

The director wants change history for both, and wants AI collaborators to work through reviewed pull requests ([ADR-004](004-human-approval-gates-for-agents.md)).

**Governing requirement (director):** an enforceable approval process matters more than automatic synchronization. No production change may happen without the director's approval. Where a tool cannot technically enforce that, the record must say so, and must not describe a written policy as an enforced control.

### Current environment

- **[O]** This repository is owned by a **personal GitHub account**, not an organization (repository API, November 11, 2026).
- **[O]** AI collaborators open pull requests through that same account. Pull requests #1, #7, #8, and #9 were all opened by it, so the author and the director's approving identity are the same account.
- **[O]** Branch protection on `main` requires one approving review and applies to administrators. Required checks are `gitleaks` and `code-nodes`.
- **[V]** "Pull request authors cannot approve their own pull requests" ([GitHub](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews)).
- **Consequence:** no pull request opened through the shared account can satisfy the current rule. This already blocks merges on this public repository, and the same problem would carry over to any private repository set up the same way.
- **[O]** AI tools reach the operational systems through credentials the director provided:
  - Base44: remote development tools, which can edit files and deploy checkpoints.
  - n8n: an API key used by a coding assistant, which can save workflow drafts.
  - Whether the n8n key can also publish or activate workflows is **[U]**.
  - Today the director's approval for AI-made changes in both systems rests on conversation and policy. It is **not technically enforced**.
- **[O]** The n8n instance distinguishes saved drafts from the published version (observed November 11, 2026, when a handoff-workflow change was saved as a draft and published separately by the director). Terms and behavior vary by n8n version **[V]** ([n8n CLI](https://docs.n8n.io/deploy/host-n8n/configure-n8n/use-the-command-line.md)).

### Verified vendor behavior

**n8n Community Edition**
- **[V]** Git-based version control and environments are not included. They are paid self-hosted features ([n8n: Community Edition features](https://docs.n8n.io/deploy/host-n8n/community-edition-features/)).
- **[V]** `n8n export:workflow --backup --output=<dir>` exports one JSON file per workflow (`--backup` sets `--all --pretty --separate`). `n8n import:workflow --separate --input=<dir>` imports them ([n8n: CLI](https://docs.n8n.io/deploy/host-n8n/configure-n8n/use-the-command-line.md)).
- **[V]** Imported workflows are deactivated by default. Exports keep their original IDs, so an import overwrites workflows with matching IDs. CLI exports do not include users and roles, execution history, variables, or instance settings, including the credential encryption key ([n8n: Backup and restore](https://docs.n8n.io/deploy/host-n8n/keep-n8n-running/backup-and-restore.md)).
- **[V]** The n8n API's workflow schema includes `staticData` (data a workflow keeps between executions) and `pinData` (pinned sample data) ([n8n API: workflow](https://docs.n8n.io/connect/n8n-api/workflow)).
- **[U]** Whether CLI exports of CAIRO's instance include those fields is not stated in the CLI documentation and is settled by test N-T2.

**Base44 GitHub sync** ([Base44: GitHub](https://docs.base44.com/developers/app-code/local-development/github.md))
- **[V]** Requires the Builder plan or higher. One repository per app, created at connection time. Sync works only with a default branch named `main`.
- **[V]** Editor saves and version-history restores are pushed as commits **directly to `main`**. There is no manual outbound push. Sync cannot be paused, only connected or disconnected.
- **[V]** After a merge into `main`:
  - backend functions deploy to preview and need **Publish** for production;
  - **entity schemas update in preview and production with no Publish step;**
  - **agents update in preview and production with no Publish step.**
- **[V]** The documentation's general instruction is "After syncing, click Publish … to make the changes live for users." Its per-resource table does not cover frontend code, so frontend behavior after a merge is **[U]**.
- **[V]** CLI deploy commands (`base44 deploy`, `functions deploy`, `entities push`, `agents push`) "bypass the remote repository," and the next sync "overwrites any changes the repository doesn't contain."
- **[V]** `base44 dev --remote` runs a local frontend against the live backend: "writes go to your live app's production data."
- **[V]** A toggle turns off automatic *inbound* sync. Commits are then pulled when someone opens the app in the editor or calls the pull endpoint. It "doesn't affect the other direction" ([Base44 API: toggle sync](https://docs.base44.com/api-reference/turn-automatic-github-sync-on-or-off.md)).
- **[V]** Connection modes:
  - The default **shared connection** commits as Base44, so GitHub cannot tell which person made a change.
  - **Per-user connections** use each member's GitHub identity, and "members without write access to the repository can't edit or publish the app."
- **[V]** Recovery limits:
  - Versions from before the connection cannot be restored afterward.
  - Disconnecting takes about 30 seconds and is unavailable while Base44's AI agent is making changes.
  - Reconnecting fails if both sides have new commits, if the repository was renamed, deleted, or had its default branch changed, or if the app moved workspaces.
  - Disconnecting an organization stops sync but **leaves the Base44 GitHub App installed**.
- **[V]** Project files ([Base44: Project structure](https://docs.base44.com/developers/backend/overview/project-structure.md)):
  - include entity *schemas*, backend functions, agent configurations, agent skills, auth settings, and connector configurations;
  - do **not** include data records, end-user accounts, published state, or agent conversation history.

**GitHub**
- **[V]** Protected branches on private repositories require GitHub Pro (personal accounts) or Team or Enterprise (organizations) ([GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)).
- **[V]** Administrators bypass protection unless it is set to apply to them. Bypass lists are available only for organization-owned repositories (same source).
- **[V]** Optional protections include required review from code owners, and requiring that the most recent push be approved by someone other than the person who pushed it (same source).
- **[V]** GitHub-native secret scanning on private repositories requires a paid GitHub Advanced Security product ([GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)). Without it, a pre-commit and CI secret scan (gitleaks) is the **primary** control.
- **[V]** A person may hold one free machine account in addition to their personal account. The account owner is responsible for the machine account's actions ([GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)).

## Enforcement boundary

GitHub review can gate only changes that travel through a GitHub merge. Every other path to production is governed by the tool it runs in.

| Change path | What enforces approval today | Status |
|---|---|---|
| (a) Merge into a GitHub `main` that a system syncs from | Branch protection, *if* author and approver are different identities | **Not enforceable today**: shared account [O]. Enforceable only after identity separation [P] |
| (b) Base44 editor edits, Publish, and AI-agent edits | Base44 workspace roles. The director operates Publish | **Director-operated, not technically enforced** against tools holding the director's credentials [O] |
| (c) Direct operations outside the repository: Base44 CLI deploy and push, `base44 dev --remote`, Base44 remote-development tools | Whoever holds the credential | **Policy only** [O] |
| (d) n8n editor, API, and CLI: save, publish or activate, import, credentials, settings | n8n user accounts and API keys | **Policy only** for AI-initiated changes [O]; API publish rights **[U]** |
| (e) Server and container configuration, tunnel, proxy, zero-trust access | Zero-trust admin access ([ADR-001](001-zero-trust-admin-access.md)) | Access-controlled; change approval is policy only |

**Consequence:** connecting GitHub cannot by itself make "no production change without approval" true, because paths (b) through (e) never pass through GitHub. This ADR improves path (a) and adds detection (version history) for the others. Preventive control for (b) through (e) is a separate decision about credentials and roles (decisions D3 and D4 below).

## Approval identity architecture

The approval rule has to rest on two different GitHub identities: the one that authors changes and the one that approves them.

| # | Option | Enforcement | Assessment |
|---|---|---|---|
| AA1 | **Separate author identity**: AI collaborators work through one machine account; the director's personal account is the only approver | [P] Required review + `CODEOWNERS` naming the director + required code-owner review + last-push approval + rules applied to admins. Then a pull request merges only with the director's approval, and a push after approval resets it | **Recommended for testing.** Allowed by GitHub's terms (one free machine account) [V]. AI tools share the machine account, so attribution between them relies on branch prefixes and commit trailers, not GitHub identity. Code-owner enforcement on a *private* personal repository is plan-dependent [U] (test I-T4) |
| AA2 | Per-tool GitHub App identities (each AI tool authors as its own app) | Same as AA1, with stronger attribution | Depends on each AI vendor offering an app that authors pull requests as itself. **[U]**, not assumed |
| AA3 | Move repositories to a GitHub organization, with AA1 or AA2 inside it | Adds teams, bypass lists, and central access review [V] | Private-repo protection needs the Team plan [V]. Worth it when more people join. Not required for AA1 |
| AA4 | Keep one shared account; the director's own merge is the approval, recorded out of band | **Weak.** Any tool holding the account's credentials can merge too. Not technically enforced | Acceptable only if described as "director-operated, not enforced." Not recommended for any repository that syncs into production |

Under AA1, the director cannot approve pull requests he authors himself. Changes the director writes go through an AI-authored pull request, or through a documented, time-limited relaxation of protection that he records afterward. **[P]**

Credential custody under AA1 **[P]**:
- The director holds the machine account's login and recovery factors in the password manager.
- AI tools receive only fine-grained tokens limited to named repositories, with contents and pull-request write and no admin rights. The tokens expire and are rotated on a schedule.
- The machine account is never a repository administrator.

**Approval records (ADR-004 consistency) [P].** Every AI-initiated production change has an attributable approval record made *before* it takes effect:
- **Repository paths:** the director's GitHub review (AA1).
- **Paths (b) through (e):** an approval in the existing team-chat approval flow ([ADR-004](004-human-approval-gates-for-agents.md), [ADR-007](007-agent-identity-and-observability.md)), naming the change, its test evidence, and its rollback.
- A pull request opened through the shared account is not, by itself, an approval record.

## Options considered

### Workflow engine (n8n)

| # | Option | Assessment |
|---|---|---|
| N1 | **Manual one-way export to a private repository**, sanitized and validated | Recommended. n8n never reads the repository, so commits there change nothing in production |
| N2 | Scheduled automated export | Deferred until N1 has run cleanly (criteria below) |
| N3 | Paid n8n plan with Git environments | Not evaluated for cost. Would turn Git into a deployment path, with the same identity questions as Base44 |
| N4 | Third-party tools that import from Git into n8n | Rejected for now. Creates a repository-to-production path |

### App-builder platform (Base44)

| # | Option | Assessment |
|---|---|---|
| B1 | Test two-way sync on a **disposable app and repository**; connect no operational app | Required before B2 can even be considered |
| B2 | Connect an operational app; protect `main` with director approval under AA1; **no bypass** | **Conditional.** Only if the tests show Base44 behaves safely and visibly when its pushes are rejected, *and* an inbound-only configuration is shown to be workable. Not rejected in principle, but unproven |
| B3 | Connect and give Base44 (or members) a bypass of the review rule | **Rejected.** Unreviewed commits on `main`, and merges that change production entities and agents. A push permission is not the same as a review exemption, and neither may be used to skip director approval |
| B4 | Connect with `main` unprotected | **Rejected.** Any repository writer could merge a change that updates production entities or agents |
| B5 | **One-way source snapshot** of operational apps into a private repository, with no sync connection | **Preferred candidate for operational apps** (details below) |
| B6 | Non-production clone app connected to GitHub, with manual promotion to the production app by the director | Viable but costly: a second app, duplicate configuration, and data separation. Promotion still happens in the Base44 editor and Publish, so the preventive gate is the same as B5. Revisit if pull-request-based development on the app becomes necessary |
| B7 | No version control (status quo) | No history, no detection of unreviewed changes |

### B5 in detail: one-way source snapshot

- **What it adds:** reviewable history and diffs of the app's source, with **no** path from the repository into production.
- **What it is not:** a preventive control. A snapshot shows *after the fact* what changed in the editor. It does not stop an unapproved editor change. Preventive control of editor changes depends on who holds Base44 edit and Publish rights (decision D3).
- **Capture method [U]:** candidates are a read-only file export through Base44's remote-development tools, run by a director-authorized tool, or a vendor export feature if one exists. Either must be read-only against the app. The method is chosen by the director (D6) after test B5-T1.
- **Coverage [V] from the project structure:**
  - **Captured:** entity schemas, backend functions, agent configurations and skills, auth settings, connector configurations.
  - **Captured if the export includes it [U]:** frontend source.
  - **Never captured:** data records, end-user accounts, published state, agent conversation history, secrets and OAuth tokens. The local app-link file is excluded.
- **Sanitization [P]:**
  - secret scan (gitleaks) and personal-information review, as for n8n exports;
  - connector configurations reviewed for embedded identifiers before commit.
- **Frequency [P]:** before and after every Publish of an operational app, plus a scheduled weekly snapshot to catch editor changes made without a Publish. Each snapshot is a pull request the director reviews.
- **Reconstruction limits:**
  - A snapshot cannot be pushed back into Base44 without a production write path (CLI deploy, the editor, or a sync connection).
  - Reconstruction is therefore a manual, director-approved production change.
  - It is tested only against a disposable app (B5-T3).

## Decision (proposed)

### 1. Repository strategy

- **[P]** Application source snapshots and workflow exports go into **private** repositories. `cairo-reference-architecture` stays **public and sanitized**, with hand-written, reviewed summaries only.
- **[P]** One private repository for n8n workflow exports. One private repository per Base44 app for B5 snapshots, matching Base44's one-repository-per-app model [V]. Preview and production are stages inside a Base44 app, not separate branches or repositories. If this ADR is accepted, the [README](../README.md)'s "private repo per environment" wording becomes "per app or per workflow instance."
- **[P]** Ownership: the personal account for now, with AA1. Moving to an organization (AA3) is a separate decision (D1).
- **[P]** Plan prerequisite: branch protection on private repositories needs GitHub Pro on a personal account [V]. Without it, the private repositories hold history only and **no review rule is enforced there**.
- **[P]** Each GitHub App is installed on selected repositories only.

### 2. Workflow exports (n8n): controlled, one-way, manual first

The repository holds **definition history**. It is not a state-preserving backup and not disaster recovery.

**Manual export cycle [P]:**

1. **Export** with the CLI inside the n8n container to a working directory on the host, outside any Git checkout. The directory is deleted after the cycle.
2. **Sanitize** each file:
   - **`pinData`**: remove. It is saved input and can hold personal information.
   - **`staticData`**: remove, because it can hold personal information. Some workflows rely on it for deduplication, cursors, or rate limits, so a workflow restored without it can behave differently at first. Each such workflow is listed in the repository with how it behaves without its stored data.
   - **Free-text and parameter fields**: Code nodes, HTTP request bodies and headers, Set values, agent prompts, and sticky notes are **manually reviewed** for personal information and secrets. Pattern scans for emails and phone numbers plus gitleaks are necessary but **not sufficient**.
   - **Hard-coded secrets**: never redacted and committed. The workflow is changed to use a stored credential, and the secret is rotated.
   - **Credential references** (ID and name): kept, because restore needs them. Not secrets, but they reveal connected services.
   - **Webhook paths**: kept, because restore needs them. Once committed, **access control on the private repository is the only thing keeping them from a reader**. Every webhook must therefore enforce its own authentication, and that is confirmed for each exported workflow before the first commit (reported privately, per [SECURITY.md](../SECURITY.md), if any gap is found).
3. **Validate**:
   - the file count matches the instance;
   - every file parses as JSON;
   - no file contains a non-empty `pinData` or `staticData`;
   - gitleaks passes;
   - the pattern scan returns only expected business addresses;
   - the manual field review is signed off;
   - the director reviews the diff against the previous export.
4. **Commit** to a branch, open a pull request, and the director approves (AA1). This is version control only.

**Never committed:** credential exports of any kind (above all `--decrypted`, which is plain text), the `.n8n` folder, the database, the encryption key, execution data, or environment files.

**Scheduled export (N2)** requires all of the following:
- director approval (D7);
- at least three consecutive clean manual cycles;
- the same checks, failing closed;
- output to a branch with a pull request, never to `main`;
- a single-repository credential held in the password manager.

The manual field review cannot be automated away, so a scheduled export still needs a human review of each pull request.

**Restore to production** is a production change and needs director approval (D9):
1. Export the current state first.
2. Import into a **non-production** instance and check it.
3. Import into production. Matching IDs are overwritten and the imported workflow arrives **deactivated**, so a live workflow can go offline.
4. Check webhook path conflicts. Activation fails if another active workflow already uses the same path.
5. Re-link credentials.
6. Expect any workflow that depended on its stored data to start fresh.
7. The director publishes or activates.

**Not disaster recovery.** Recovering the instance needs a separate, encrypted, off-host backup, never in GitHub, of:
- the database;
- the `.n8n` folder, including the encryption key;
- credentials, users, and variables;
- execution history if wanted;
- deployment configuration: containers, tunnel, proxy allowlist, zero-trust access.

That backup and a tested restore are an open gap (D10).

### 3. Base44

- **No operational app is connected** to GitHub sync until the director accepts a configuration on the strength of the disposable-app tests.
- For operational apps, **B5 is the preferred candidate.** It is adopted only after tests B5-T1 to B5-T3 and the director's choice of method (D6).
- B2 is reconsidered only if the B1 tests meet the acceptance criteria below.

### 4. Production-impact matrix

| Action | System | Production effect | Technical gate today | Required approval [P] |
|---|---|---|---|---|
| Export, commit, open PR, or merge in the n8n-exports repository | GitHub | **None.** Version control only | Branch protection, after AA1 | Director review of the PR |
| Save a workflow in the n8n editor or through the API | n8n | Draft only, on this instance's version [O] | n8n accounts and API keys | Policy: director approves AI-initiated edits |
| Publish, activate, or deactivate a workflow | n8n | **Production change** | n8n accounts; API key rights **[U]** | Director, with an approval record |
| Import a workflow into production | n8n | **Production change.** Overwrites by ID; deactivates | Host access | Director (D9) |
| Change credentials, settings, or webhook authentication | n8n | **Production change** | n8n accounts | Director |
| Change containers, tunnel, proxy, or zero-trust policy | Server | **Production change** | Zero-trust admin access | Director |
| Edit a backend function in the Base44 editor | Base44 | Preview until Publish **[U]** (test E-T3) | Base44 roles | Director publishes |
| Edit an entity schema or agent in the Base44 editor | Base44 | **May reach production without Publish [U]** (tests E-T1, E-T2) | Base44 roles | Director, before the edit |
| Edit frontend code in the Base44 editor | Base44 | Production on Publish **[U]** (test E-T4) | Base44 roles | Director publishes |
| Publish | Base44 | **Production change** | Base44 roles | Director |
| Base44 AI agent edits in the editor | Base44 | As for the resource edited | Base44 roles | Director, before the edit |
| Base44 CLI deploy or push commands | Base44 | **Production change**, outside the repository; overwritten by the next sync if connected [V] | Credential holder | Director; prohibited for AI tools unless approved per change |
| `base44 dev --remote` | Base44 | **Writes live production data** [V] | Credential holder | Director; prohibited against operational apps unless approved |
| Base44 remote-development tools (file edits, checkpoint deploy) | Base44 | Checkpoint deploy is a **production change** [O] | Credential holder | Director, per change |
| *If connected:* editor save | Base44 + GitHub | As above, plus an unreviewed commit to `main` [V] | None on the GitHub side | Not acceptable without the B2 test results |
| *If connected:* merge to `main` changing entities or agents | Base44 + GitHub | **Production change, immediate, no Publish** [V] | Branch protection (AA1) | Director review, treated as a production deployment |
| *If connected:* merge to `main` changing functions | Base44 + GitHub | Preview until Publish [V] | Branch protection (AA1) | Director review, plus Publish |
| *If connected:* merge with automatic inbound sync off | Base44 + GitHub | Takes effect **later**, when someone opens the editor or pulls [V] | None at the moment of effect | Director; the effect time must be recorded |
| *If connected:* mixed-resource PR | Base44 + GitHub | Highest-risk effect of any file in it | Branch protection (AA1) | Treated as a production deployment |
| *If connected:* GitHub revert of a merged change | Base44 + GitHub | **Production change** (a new merge) | Branch protection (AA1) | Director |
| Connect, disconnect, change sync mode or the inbound toggle | Base44 | **Configuration change** | App owner | Director only |
| Change repository access, protection, CODEOWNERS, tokens, app installs | GitHub | **Control change** | Repository admin | Director only |
| Merge into `cairo-reference-architecture` | GitHub | Public disclosure; no production effect | Branch protection (deadlocked today [O]) | Director |

## Security risks

| Risk | Mitigation [P] |
|---|---|
| Same account authors and approves, so the review rule is unenforceable or deadlocked | AA1 identity separation; tested on a disposable private repository first |
| AI tools hold the director's credentials for Base44 and n8n | Decision D3/D4: separate, least-privilege credentials per tool where the vendor supports it; otherwise record these paths as policy-only |
| Personal information in exports | Strip `pinData` and `staticData`; manual field review; synthetic data in all tests |
| Secrets committed | gitleaks before commit and in CI as the primary control (no native private-repo scanning without a paid product [V]); rotate on any finding |
| Repository exposure reveals webhook paths, connected services, prompts | Private repositories; two-factor authentication; minimal access; webhooks keep their own authentication |
| A merge silently changes production entities or agents | No operational connection; any connected repository treats merges as production deployments |
| Bypass identities | Rejected (B3) |
| Base44 GitHub App left installed after disconnect | Teardown includes uninstalling the app on GitHub [V] |
| Emergency stop unavailable during Base44 AI edits | Avoid AI edits on connected apps; disconnection steps rehearsed in tests |
| Plan without private-repo protection | Check the plan first (D2); without protection, private repositories are history only and must not feed production |

## Rollback and recovery limitations

- **Base44 entity schemas:** reverting applies a new schema. It does not restore records that were dropped or altered.
- **Base44 connection:** pre-connection versions become unrestorable; reconnection can fail; sync cannot be paused; disconnection is blocked while the AI agent edits; AI conflict resolution is itself an unreviewed change. [V]
- **B5 snapshots:** cannot be applied back without a production write path.
- **n8n exports:** definitions only. They do not restore credentials, stored workflow data, execution history, users, or variables. An import deactivates the workflow and can collide on webhook paths.
- **A GitHub revert is not an undo.** It is a new change through the same paths.

## Test procedures

Each test records:
- date, operator, configuration, and the observed result;
- the evidence location;
- whether the result matched expectations.

A test not run is reported as not run. All tests use **synthetic data**. **Nothing is added to production workflows or production apps for testing.**

### Identity tests (disposable private repository, no Base44 and no n8n)

| # | Test | Pass condition |
|---|---|---|
| I-T1 | Machine account opens a PR and tries to merge it | Merge blocked |
| I-T2 | Director approves; machine account merges | Merge allowed |
| I-T3 | Machine account pushes after approval | Approval no longer counts; merge blocked |
| I-T4 | Machine account approves a director-authored PR | Does not satisfy the code-owner rule (checks plan support) |
| I-T5 | Direct push to `main` by the machine account, then by the director | Both rejected |

### n8n (non-production instance with synthetic workflows only)

The non-production instance is a temporary local container with no production credentials and no public webhooks (D8).

| # | Test |
|---|---|
| N-T1 | Export; file count matches |
| N-T2 | Raw export contains `pinData` and `staticData` when present (settles the [U] above) |
| N-T3 | Sanitizer removes synthetic `pinData` and `staticData`; validation passes |
| N-T4 | A planted fake token fails the cycle |
| N-T5 | Planted synthetic personal information in a prompt, an HTTP body, and a sticky note: pattern scan results recorded; manual review catches the rest |
| N-T6 | Import the sanitized set: workflows load deactivated; credentials need re-linking |
| N-T7 | A workflow that uses stored data behaves as documented after restore |
| N-T8 | Restore while another workflow holds the same webhook path: activation fails visibly |

### Base44 (disposable app and disposable private repository; resets between phases)

**Phase E: editor baseline, no GitHub connection.** Settles how much the editor already bypasses Publish.

| # | Test |
|---|---|
| E-T1 | Edit an entity schema; check production before Publish |
| E-T2 | Edit an agent; check production before Publish |
| E-T3 | Edit a backend function; check production before Publish |
| E-T4 | Edit frontend code; check production before Publish |

**Phase A: connected, `main` unprotected.** Characterizes inbound behavior. The repository holds synthetic data only.

| # | Test |
|---|---|
| A-T1 | Editor edit: commit contents and author under shared and per-user modes |
| A-T2 | Merge a function change: preview only until Publish |
| A-T3 | Merge an entity change with synthetic records present: production effect and record impact |
| A-T4 | Merge an agent change: production effect |
| A-T5 | Merge a frontend change: production effect |
| A-T6 | Inbound sync off, merge, then open the editor: when the change takes effect |
| A-T7 | Conflict on both sides: what AI resolution changes |
| A-T8 | Restore a version: what is pushed |
| A-T9 | CLI deploy, then a sync: the CLI change is overwritten |
| A-T10 | `base44 dev --remote` write: confirm it reaches live data |

**Reset:** disconnect, uninstall the app from the repository, and delete the app and repository. Phase P starts with a fresh disposable app and repository.

**Phase P: connected, `main` protected under AA1, no bypass.**

| # | Test |
|---|---|
| P-T1 | Editor edit: is the push rejected, and how does Base44 report it (error, retry, silent divergence, blocked editor)? |
| P-T2 | After P-T1: can the app still be edited and published; is the divergence visible; how does it recover (disconnect)? |
| P-T3 | Can an approved PR still be applied inbound in this state? If not, B2 fails |
| P-T4 | Disconnect during and after an AI-agent edit |

**Teardown:** disconnect; uninstall the Base44 GitHub App from GitHub; confirm the app cannot reach repositories outside its selection; delete the disposable app and repository.

### B5 snapshot (disposable app first)

| # | Test |
|---|---|
| B5-T1 | Capture method is read-only and complete against the project structure |
| B5-T2 | Snapshot passes sanitization; diff between two snapshots shows an editor change |
| B5-T3 | Reconstruct a second disposable app from a snapshot; record what could not be rebuilt |

### Acceptance criteria (director signs off)

- **B2 remains possible** only if:
  - P-T1 and P-T2 show rejected pushes are visible and recoverable;
  - P-T3 shows approved changes can still be applied;
  - E-T1 to E-T4 are understood and accepted.
- **B5 is adopted** only if B5-T1 to B5-T3 pass.
- **N1 starts** only after N-T1 to N-T6 pass.

## Decisions requiring the director's approval

| # | Decision |
|---|---|
| D1 | Repository ownership: personal account, or move to an organization (AA3) |
| D2 | GitHub plan: Pro for a personal account, or Team for an organization, for private-repository protection. Optional paid secret scanning |
| D3 | Who and what may edit and publish in Base44, including AI tools and their credentials |
| D4 | Who and what may edit and publish or activate in n8n, including API keys held by AI tools and what each key may do |
| D5 | Approval identity architecture (AA1, AA2, or AA4), the machine account, `CODEOWNERS`, and protection settings, after I-T1 to I-T5 |
| D6 | B5 snapshot method, scope, frequency, and retention |
| D7 | Moving from manual to scheduled n8n exports, and the credential used |
| D8 | Creating the disposable repositories, the disposable Base44 apps, the non-production n8n instance, and every GitHub App install, each limited to selected repositories |
| D9 | Any restore or import into production, and the activation that follows |
| D10 | Design, custody, and a tested restore of the separate n8n disaster-recovery backup |
| D11 | Credential and key custody: password manager, rotation schedule, recovery factors for the machine account |
| D12 | Private-repository retention, and incident response if a private repository is exposed |
| D13 | Acceptance criteria and sign-off for the disposable experiments |
| D14 | The release gate per Base44 resource type (frontend, functions, entities, agents) after phase E |
| D15 | Any direct deployment or CLI action outside GitHub on an operational app |
| D16 | Whether to connect any operational Base44 app (B2), separately per app |
| D17 | How to resolve the current merge deadlock on this public repository (immediate; see Current environment) |

**Separate open decision, not covered here:** the scheduling and invoice exception under [ADR-004](004-human-approval-gates-for-agents.md), raised by ADR-008 (in review in pull request #7). ADR-009 does not resolve it or treat it as normal practice.

## Consequences

- Workflow definitions and app source gain history and review **with no new path into production**.
- Path (a) becomes enforceable only after identity separation. Paths (b) through (e) remain **director-operated, not technically enforced**, until D3 and D4 change credentials and roles. Snapshots add detection of unreviewed changes, not prevention.
- Operational Base44 apps stay unconnected. Changes continue through the Base44 editor and Publish, operated by the director, and are not yet independently enforced.
- Disaster recovery for the workflow engine remains an open gap (D10).
- Maps to NIST AI RMF *Govern* (accountability, access control) and *Manage* (change management, recovery); see the [governance mapping](../governance/nist-ai-rmf-mapping.md). Follows the evidence and status rules of the [AI Engineering Methodology](../docs/AI-ENGINEERING-METHODOLOGY.md).
