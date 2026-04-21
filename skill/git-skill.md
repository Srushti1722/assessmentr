---
name: assessmentr-git
description: Git workflow and standards for the assessmentr project. Read this before creating branches, writing commit messages, opening pull requests, or resolving merge conflicts. Defines branching strategy, commit conventions, PR rules, and what never to commit.
---

# assessmentr Git Standards
**Project:** `assessmentr`

---

## Branching Strategy

We use a simplified **Git Flow** with three permanent branches and short-lived feature branches.

```
main          ← production-ready code only. Never commit directly.
dev           ← integration branch. All features merge here first.
feature/*     ← your working branch for any new feature or fix.
```

### Branch Naming Convention
```
feature/<page>-<short-description>
fix/<page>-<short-description>
chore/<short-description>

Examples:
  feature/page1-speaking-indicator
  feature/page2-knowledge-graph
  feature/page3-concept-trends
  fix/page1-mic-button-pulse
  fix/page2-mobile-navbar
  chore/update-dependencies
  chore/add-env-example
```

### Rules
- Always branch off from `dev`, not `main`
- One feature or fix per branch — keep it focused
- Delete your branch after it is merged
- Never commit directly to `main` or `dev`

---

## Setting Up Locally

```bash
# Clone the repo
git clone https://github.com/your-org/assessmentr.git
cd assessmentr

# Always start from dev
git checkout dev
git pull origin dev

# Create your feature branch
git checkout -b feature/page2-knowledge-graph
```

---

## Commit Message Convention

We follow **Conventional Commits**. Every commit message must follow this format:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types
| Type | When to use |
|---|---|
| `feat` | New feature or visible UI addition |
| `fix` | Bug fix |
| `style` | CSS/visual changes, no logic change |
| `refactor` | Code restructure, no behavior change |
| `chore` | Config, dependencies, tooling |
| `docs` | Documentation updates (including .md files) |
| `test` | Adding or updating tests |

### Scope (use the page or component name)
```
page1, page2, page3, navbar, graph, transcript, mic, analysis, dashboard, global
```

### Examples
```bash
git commit -m "feat(page1): add speaking indicator waveform animation"
git commit -m "fix(page2): fix knowledge graph node overlap on mobile"
git commit -m "style(navbar): update active link teal underline"
git commit -m "feat(page3): add concept trend chart tab switching"
git commit -m "chore: add .env.example file"
git commit -m "refactor(mic): extract useMicState into custom hook"
git commit -m "docs: update software-engineering.md with WebSocket section"
```

### Rules
- Keep subject line under 72 characters
- Use present tense: "add feature" not "added feature"
- No period at the end of subject line
- Write a body if the change is non-obvious (explain *why*, not *what*)

---

## Daily Workflow

```bash
# 1. Start of day — pull latest dev into your branch
git checkout dev
git pull origin dev
git checkout feature/your-branch
git merge dev               # or: git rebase dev

# 2. Work, then stage and commit often (small commits)
git add src/components/MicButton.jsx
git commit -m "feat(mic): add pulsing ring animation on active state"

# 3. Push your branch
git push origin feature/your-branch

# 4. When feature is complete — open a Pull Request to dev
```

---

## Pull Request (PR) Rules

### PR Title Format
Same as commit convention:
```
feat(page2): add knowledge graph with mastery nodes
fix(page1): correct speaking indicator sync with transcript
```

### PR Checklist (before opening)
- [ ] Branch is up to date with `dev`
- [ ] Code runs locally without errors
- [ ] All three pages still render correctly (no regressions)
- [ ] No `console.log` statements left in code
- [ ] No `.env` or secrets committed
- [ ] Component follows `Design-skill.md` (colors, fonts, spacing)
- [ ] New files/folders follow structure in `Software-skill.md`

### PR Description Template
```
## What does this PR do?
Brief description of the change.

## Pages/Components affected
- page1-mockinterview.jsx
- MicButton.jsx

## How to test
1. Open /interview
2. Press the mic button
3. Confirm pulsing ring appears

## Screenshots (if UI change)
[attach screenshots here]
```

### Review Rules
- At least **1 approval** required before merging to `dev`
- At least **2 approvals** required before merging `dev` → `main`
- Reviewer should check: design system compliance, no hardcoded values, API service pattern followed
- PR author resolves all comments before merging

---

## Merging

```bash
# Merge feature → dev (via GitHub PR, not command line)
# After PR is approved and merged:

# Clean up locally
git checkout dev
git pull origin dev
git branch -d feature/your-branch          # delete local branch
git push origin --delete feature/your-branch  # delete remote branch
```

**Merge strategy:** Squash and merge for feature branches → keeps `dev` history clean.
**Merge strategy:** Merge commit for `dev` → `main` → preserves release history.

---

## What NEVER to Commit

```
.env                    ← API keys and secrets
node_modules/           ← install locally with npm install
dist/ or build/         ← generated at deploy time
*.log                   ← log files
.DS_Store               ← macOS system files
Thumbs.db               ← Windows system files
```

### .gitignore (minimum required)
```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Editor
.vscode/settings.json
.idea/
```

---

## Releases (dev → main)

When a set of features is stable on `dev`:

1. Create a PR: `dev` → `main`
2. PR title: `release: v<major>.<minor>.<patch>` (e.g., `release: v1.2.0`)
3. Write release notes in PR description (list all features merged since last release)
4. 2 approvals required
5. Merge using **merge commit** (not squash)
6. After merge, tag the release:
```bash
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0 — adds deep analysis concept trends"
git push origin v1.2.0
```

### Version Numbering
```
v<major>.<minor>.<patch>

major: breaking change or full page rewrite
minor: new feature added (new component, new section)
patch: bug fix or small style correction
```

---

## Resolving Merge Conflicts

```bash
# If dev has moved ahead of your branch:
git checkout feature/your-branch
git merge dev

# If conflicts appear in a file:
# 1. Open the file — look for <<<<<<, =======, >>>>>>>
# 2. Keep the correct version (yours, theirs, or a combination)
# 3. Remove all conflict markers
# 4. Stage the resolved file
git add src/components/MicButton.jsx
git commit -m "chore: resolve merge conflict in MicButton"
```

**Rule:** When in doubt about whose code to keep — ask your senior before resolving. Do not guess.

---

## Quick Reference

```bash
# See what branch you're on
git branch

# See status of files
git status

# See recent commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes (dangerous — can't undo)
git checkout -- .

# See difference before committing
git diff
```