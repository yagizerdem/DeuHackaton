# `commit-message` Claude Skill

A Claude skill that generates semantic git commit messages based on your staged changes with optional emoji support. Analyzes your diffs and creates conventional commit messages following best practices.

## What it does

- Analyzes staged changes and generates semantic commit messages with proper type classification
- Provides a `/commit-message` slash command for quick access.
- Supports optional emoji prefixes and follows conventional commit format
- Reviews recent commit history to maintain consistent style
- Asks for user approval before creating commits or pushing to remote

## Installation

### Option 1: Via Plugin Marketplace (Recommended)

Launch Claude Code first:

```bash
claude
```

Then from within Claude Code, add the marketplace and install the skill:

```bash
# Add the marketplace
/plugin marketplace add thecarlo/carlo-marketplace

# Install the plugin
/plugin install commit-message@carlo-marketplace
```

### Option 2: Clone this repository

```bash
# Clone the repository
git clone https://github.com/thecarlo/carlo-marketplace.git

# Option A: Add to your Claude Code plugins directory
cp -r carlo-marketplace/plugins/commit-message ~/.config/claude/plugins/

# Option B: Add skill directly to your Claude Code skills directory
cp -r carlo-marketplace/plugins/commit-message/skills/commit-message ~/.config/claude/skills/
```

## Uninstalling

Launch Claude Code first:

```bash
claude
```

Then from within Claude Code, uninstall the plugin:

```bash
/plugin uninstall commit-message
```

To remove the marketplace entirely:

```bash
/plugin marketplace remove carlo-marketplace
```

## Usage

In your Claude Code session, use any of the prompts below:

### Prompt 1 (auto detect skill)

```
create a git commit message
```

Creates a commit message without a gitmoji.

### Prompt 2

```
/commit-message
```

Creates a commit message without a gitmoji.

### Prompt 3

```
/commit-message gitmoji
```

Creates a commit message with a gitmoji.

### Prompt 4

```
use the commit-message skill to create a commit message
```

## Commit Message Format

The skill generates commits in this format:

```
[emoji] type(scope): subject

body

footer
```

### Commit Types

| Type     | Description                      | Emoji |
| -------- | -------------------------------- | ----- |
| feat     | A new feature                    | ✨    |
| fix      | A bug fix                        | 🐛    |
| docs     | Documentation changes            | 📚    |
| style    | Code formatting changes          | 💄    |
| refactor | Code refactoring                 | ♻️    |
| perf     | Performance improvements         | ⚡    |
| test     | Adding or updating tests         | ✅    |
| chore    | Build process or tooling changes | 🔨    |
| ci       | CI/CD changes                    | 👷    |
| build    | Build system changes             | 📦    |
| revert   | Reverting previous changes       | ⏮️    |
| security | Security fixes                   | 🔒    |

### Example Commits

**Without emoji:**

```
feat(auth): add two-factor authentication

Implements TOTP-based 2FA for enhanced security. Users can enable
2FA in their account settings and use authenticator apps.
```

**With emoji:**

```
✨ feat(auth): add two-factor authentication

Implements TOTP-based 2FA for enhanced security. Users can enable
2FA in their account settings and use authenticator apps.
```
