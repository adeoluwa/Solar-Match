# Commit Message Convention

This repo follows **[Conventional Commits](https://www.conventionalcommits.org/)**.
A consistent history makes it easy to scan changes, auto-generate changelogs, and
reason about releases. Every commit message should follow the format below.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **`type`** — _required_. What kind of change this is (see the table below).
- **`scope`** — _optional_. The part of the codebase affected, in parentheses.
- **`subject`** — _required_. A short, imperative summary of the change.
- **`body`** — _optional_. The "what" and "why", not the "how". Wrap at ~72 chars.
- **`footer`** — _optional_. Breaking changes and issue references.

Only the first line (`type(scope): subject`) is mandatory. Everything else is added when it helps.

### Examples (from this project)

```
feat: add script for admin seeding
feat(email): include email analytics
fix(auth): reject login when the role toggle does not match the account
docs(readme): document the State / LGA location field
refactor(users): move password hashing into the service layer
chore(deps): bump sequelize to 6.37.8
```

## Types

| Type       | Use it for…                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `feat`     | A new feature or capability                                              |
| `fix`      | A bug fix                                                                |
| `docs`     | Documentation only (README, this file, code comments)                   |
| `style`    | Formatting only — whitespace, semicolons, Prettier (no logic change)    |
| `refactor` | A code change that neither fixes a bug nor adds a feature               |
| `perf`     | A change that improves performance                                      |
| `test`     | Adding or correcting tests                                              |
| `build`    | Build system, dependencies, or package scripts                         |
| `ci`       | CI configuration and pipelines                                         |
| `chore`    | Routine maintenance that doesn't touch `src` (tooling, configs)        |
| `revert`   | Reverting a previous commit                                            |

## Scopes

The scope is optional but encouraged. Prefer the service or module the change lives in:

- **Services:** `main-app`, `email-service`, `workers`
- **Modules / areas:** `auth`, `users`, `email`, `db`, `queue`, `config`, `deps`, `docs`

Pick the narrowest scope that fits. A change spanning several areas can drop the scope entirely:
`chore: unify eslint config across services`.

## Subject rules

- Use the **imperative mood**: "add", "fix", "remove" — not "added" / "adds" / "fixing".
  (Tip: it should complete the sentence _"If applied, this commit will \_\_\_"_.)
- **Lowercase** the first letter; **no period** at the end.
- Keep it **under ~72 characters**.
- Describe the change, not the file touched.

```
✅ feat(users): enforce the customer/installer login toggle
❌ Feat(users): Enforced the toggle.                 (capitalised, past tense, trailing period)
❌ update users.service.js                            (no type; describes the file, not the change)
```

## Body

Explain **why** the change was made and anything a reviewer needs to know. Reference the
problem, not the diff. Separate the subject from the body with a blank line.

```
fix(auth): reject login when the role toggle does not match the account

A customer could sign in through the installer screen and vice-versa, because
login only checked email + password. We now compare the submitted role against
the stored role after the password check and return 403 on a mismatch.
```

## Footer

### Breaking changes

Start a footer line with `BREAKING CHANGE:` describing the break and the migration path:

```
feat(users): split location into separate state and lga fields

BREAKING CHANGE: the register endpoint no longer accepts a single `location`
string. Send `state` and `lga` instead. Existing rows are backfilled by the
20261130-split-location migration.
```

(You can also flag it inline with a `!` after the type/scope: `feat(users)!: …`.)

### Linking issues

Reference issues or PRs in the footer:

```
Closes #42
Refs #17, #18
```

## Branches (bonus)

Name branches with a matching prefix so work is easy to trace:
`feat/admin-dashboard`, `fix/login-role-mismatch`, `chore/ci-setup`.
Open pull requests into `development`, not `main`.
