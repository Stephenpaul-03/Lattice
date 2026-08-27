# Lattice

Lattice is a markdown-based learning workspace for collecting notes, references, questions, and connected ideas. Subjects provide the top-level navigation, while lessons keep the source material close to the thinking it supports.

## Features

- Subject-based workspaces with JSON-defined sidebars
- Markdown lessons with optional frontmatter and split layouts
- Search across subjects and recently visited topics
- Light and dark themes
- Quiz blocks for guided concept checks

## Tech stack

- React 19 and TypeScript
- Vite
- Tailwind CSS 4
- Radix UI and shadcn/ui patterns
- `marked` for Markdown parsing and Prism for code highlighting

## Getting started

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To test a production build:

```sh
npm run build
npm run preview
```

## Content model

A subject is wired together by a registration entry, a sidebar definition, and Markdown content:

```text
src/constants/subjects.ts
public/content/<SubjectId>_Sidebar.json
public/content/<SubjectId>/home.md
public/content/<SubjectId>/<Category>/<lesson-slug>.md
```

Sidebar topic paths determine the lesson route. The loader looks for the matching slug under the category folder and also supports `01-<slug>.md` and `1-<slug>.md` filename prefixes.

For the expected JSON shape, frontmatter options, quiz syntax, and a complete example, see [USAGE.md](USAGE.md). [ADDING_SUBJECTS.md](ADDING_SUBJECTS.md) contains the quick checklist.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

Run `npm run build`, `npm run lint`, and `git diff --check` before committing changes.
