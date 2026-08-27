---
name: create-lattice-subject
description: Create and register a new Lattice learning subject from files placed in a staging folder. Use when a user asks to add, import, or turn staged markdown content into a new workspace, including sidebar generation, route registration, workspace copy, assets, quizzes, and validation.
---

# Create a Lattice subject

Use this workflow when the user has placed a new subject's files into a staging folder and wants the subject added to Lattice.

## Guardrails

- Work only inside the Lattice repository.
- Treat the staging folder as source material. Do not delete or rewrite it unless the user explicitly asks.
- Preserve existing subjects and unrelated user changes.
- Ask for the subject ID and display label if they cannot be inferred safely from the staged files.
- Use a short ID with letters and digits only; prefer PascalCase, for example `Databases` or `FrontendBasics`.
- Do not add Playground, sandbox, or workspace-specific React components. Subjects are markdown and JSON data.

## 1. Locate and inspect staging

Find likely staging directories before editing:

```sh
find . -maxdepth 3 -type d \( -iname "staging" -o -iname "stagging" \) -print
rg --files <staging-directory>
```

If there is more than one candidate, inspect each and ask which one to use. Identify:

- the intended subject ID and display label;
- an overview or README that can become the subject overview;
- lesson markdown files;
- category folders or an existing sidebar JSON;
- images and other assets referenced by markdown;
- frontmatter, `:::quiz` blocks, and any unsupported interactive content.

Do not silently discard unsupported files. Explain where they can be represented as markdown or ask for direction.

## 2. Map the staged structure

Create the runtime structure below:

```text
public/content/<SubjectId>_Sidebar.json
public/content/<SubjectId>/home.md
public/content/<SubjectId>/<Category Title>/<lesson-slug>.md
```

The category title in the sidebar must exactly match the directory name because the app uses that title when resolving lesson files.

Each sidebar topic path must have this shape:

```text
/<category-slug>/<lesson-slug>
```

The lesson slug is the third segment of the path and must match the markdown filename, ignoring an optional numeric ordering prefix. The loader checks these filename forms:

```text
lesson-slug.md
01-lesson-slug.md
1-lesson-slug.md
```

Use `home.md` for the workspace overview. If the staged material has no clear overview, create a short one that explains the subject and points learners toward the first category.

## 3. Generate or validate the sidebar

Use this schema:

```json
{
  "home": { "label": "Overview", "path": "/" },
  "categories": [
    {
      "title": "Category Title",
      "topics": {
        "Readable Lesson Name": "/category-slug/lesson-slug"
      }
    }
  ]
}
```

Prefer an existing staged sidebar when it is complete and consistent. Otherwise generate one from the staged folders and filenames. Keep labels human-readable; keep paths lowercase and URL-safe.

Before continuing, verify every topic maps to one staged or created markdown file and every created markdown file is reachable from the sidebar unless it is an intentional asset or overview.

## 4. Prepare markdown and assets

- Keep lesson content in markdown.
- Preserve frontmatter such as `title`, `layout`, and `mdn` when supported by the app.
- Use `layout: document` by default. Do not add sandbox fields.
- Use root-relative image paths such as `/content/<SubjectId>/images/example.png` so images work from every lesson route.
- Place referenced images under `public/content/<SubjectId>/...` and verify their paths case-sensitively.
- Keep image alt text meaningful; markdown images are rendered centered and responsive by the app.
- Preserve valid `:::quiz` blocks. Multiple blocks in one lesson are supported and become a sequential Concept Check.
- Convert unsupported interactive examples into explanatory markdown, code blocks, or a clear TODO rather than inventing a new component.

## 5. Register the subject

Add one entry to `src/constants/subjects.ts`:

```ts
{ id: "<SubjectId>", label: "<Display Label>", sidebarUrl: "/content/<SubjectId>_Sidebar.json" }
```

Add matching copy to `src/constants/ui-copy.json`:

```json
{
  "globalHome": {
    "workspaces": {
      "<SubjectId>": "Short description shown on the workspace picker."
    }
  },
  "workspaceLoader": {
    "workspaces": {
      "<SubjectId>": {
        "title": "Opening <Display Label>",
        "description": "Short loading message for this workspace."
      }
    }
  }
}
```

The copy keys must match the subject ID exactly. Missing keys make the global homepage or workspace loader render incomplete content.

## 6. Validate before handoff

Run:

```sh
npm run build
npm run lint
git diff --check
```

Also verify:

- the new subject appears in the global workspace picker;
- `/` still opens the app-level homepage;
- `/<SubjectId>-home` opens the subject overview;
- at least one category lesson opens from the sidebar;
- images resolve from a lesson route;
- a lesson with multiple quiz blocks renders a sequential Concept Check;
- existing subjects and staged source files remain intact.

If browser access is available, smoke-test the picker, loader, sidebar, search, light/dark themes, and a direct lesson URL. If browser access is unavailable, report that limitation while still reporting build and lint results.

## Handoff

Summarize the new subject ID and label, the overview route, the categories added, the asset handling, and the validation commands and results. Mention any staged files that could not be represented without additional product decisions.
