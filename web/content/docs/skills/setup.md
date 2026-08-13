---
title: "Set up SeoTool.im Agent Skills"
description: "Add SeoTool.im skill files to your AI agent after connecting SeoTool.im MCP."
---

SeoTool.im Agent Skills are separate files from SeoTool.im MCP.

First, [set up SeoTool.im MCP](/docs/mcp). MCP gives your agent access to SeoTool.im data.

Then add the SeoTool.im `SKILL.md` files you want your agent to use. Each skill gives your agent one SEO workflow.

## Choose an installation option

Pick the option that matches how you want to install the files.

### Option 1: Install and choose interactively

Use this if you want the installer to show the available skills and agents.

```bash
npx skills add emerilansel-jpg/SeoTool
```

### Option 2: Install all SeoTool.im skills

Use this if you want every SeoTool.im skill.

```bash
npx skills add emerilansel-jpg/SeoTool --skill '*'
```

### Option 3: Install all skills for Claude Code only

Use this if the skills should be available in Claude Code only.

```bash
npx skills add emerilansel-jpg/SeoTool --skill '*' --agent claude-code
```

### Option 4: Install all skills for OpenAI Codex only

Use this if the skills should be available in Codex only.

```bash
npx skills add emerilansel-jpg/SeoTool --skill '*' --agent codex
```

### Option 5: Copy the skill files manually

Use this if you prefer to copy files into your agent's skills folder.

```bash
git clone https://github.com/emerilansel-jpg/SeoTool.git

# Codex
mkdir -p ~/.codex/skills
cp -R open-seo/.agents/skills/* ~/.codex/skills/

# Claude Code
mkdir -p ~/.claude/skills
cp -R open-seo/.agents/skills/* ~/.claude/skills/
```

You can also review the source skills on GitHub:

- [SeoTool.im Agent Skills on GitHub](https://github.com/emerilansel-jpg/SeoTool/tree/main/.agents/skills)

Each skill page also links to its source `SKILL.md`.

## Run a skill

After the skill files are available to your agent, run the matching slash command:

- `/seo-project-setup`
- `/seo-coach`
- `/keyword-research`
- `/keyword-clustering`
- `/competitive-landscape`
- `/competitor-analysis`
- `/link-prospecting`

## Next step

Start with [SEO Project Setup](/docs/skills/seo-project-setup) if this is a new SEO project, or [SEO Coach](/docs/skills/seo-coach) if you are not sure which workflow to run first.
