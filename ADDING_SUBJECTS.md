# Adding a new Subject (menu) + lessons

This project’s UI is driven by **subjects**. A subject is a top-level “menu” in the app, backed by:

1. `src/constants/subjects.ts` (registration)
2. a sidebar definition JSON in `public/content/` (the menu + routes)
3. markdown lessons in `public/content/<subjectId>/...md` (the content)

---

## 1) Register the subject
Edit:

- `src/constants/subjects.ts`

Add an entry like:

```ts
{ id: "NEW_ID", label: "New Subject Label", sidebarUrl: "/content/NEW_SIDEBAR.json" }
```

Notes:
- `id` must match the folder name under `public/content/<id>/...`.
- `sidebarUrl` is a public URL path to the JSON file.

---

## 2) Create the subject sidebar JSON
Create:

- `public/content/NEW_SIDEBAR.json`

Based on existing sidebars like `public/content/CSS_Sidebar.json` / `public/content/AWS_Sidebar.json`.

### Expected JSON shape

- `home`: `{ "label": string, "path": string }`
- `categories[]`: each has:
  - `title`: string (also used as a folder name candidate)
  - `topics`: object where keys are topic labels and values are either:
    - `"/some/route"` (string), or
    - `{ "path": "/some/route", "layout": "split" }` (layout optional)

---

## 3) Add markdown files for the subject home + lessons
The app loads the sidebar JSON, then verifies markdown URLs exist.

### Subject home
The app tries these URLs (in order) for the subject home:

- `/content/<subjectId>/home.md`
- `/content/<subjectId>/index.md`

So add one of these:

- `public/content/NEW_ID/home.md`
  **or**
- `public/content/NEW_ID/index.md`

### Topic markdown resolution
For each topic in your sidebar, the app uses:
- `category.title` as a folder segment candidate
- `topic.slug` derived from `topic.path`

It then checks candidate markdown URLs (in order):

1. `/content/<subjectId>/<categorySegment>/<slugSegment>.md`
2. `/content/<subjectId>/<categorySegment>/<twoDigitPrefix>-<slugSegment>.md`
3. `/content/<subjectId>/<categorySegment>/<singleDigitPrefix>-<slugSegment>.md`

Practical guideline:

If your sidebar uses something like:
- `category.title`: `Typography`
- `topic.path`: `/typography/font-family`

Then the most common working file is:
- `public/content/<subjectId>/Typography/font-family.md`

It may also work with numeric prefixes (examples it will try):
- `public/content/<subjectId>/Typography/01-font-family.md`
- `public/content/<subjectId>/Typography/1-font-family.md`

---

## 4) (Optional) Add lesson layouts (e.g. split / quiz)
A sidebar topic can set a layout, for example:

```json
"font-family": { "path": "/typography/font-family", "layout": "split" }
```

Layouts and quiz rendering are controlled by markdown frontmatter / custom blocks.

### Frontmatter
The markdown parser supports frontmatter like:

```md
---
layout: split
title: Font Family
---

# Your content
```

### Quiz blocks
The markdown parser also supports quiz blocks like:

```md
:::quiz
question: What does ...?
options:
- Option A
- Option B (correct)
explanation: Because ...
:::
```

---

## Quick checklist
When adding `NEW_ID`:

1. Add subject entry in `src/constants/subjects.ts`
2. Add `public/content/NEW_SIDEBAR.json`
3. Add `public/content/NEW_ID/home.md` (or `index.md`)
4. For each topic, add markdown at:
   - `public/content/NEW_ID/<CategoryTitle>/<slug>.md`
   - (or `01-<slug>.md` / `1-<slug>.md` if needed)

---

## Where to look in the code
- `src/constants/subjects.ts` (subject registration)
- `src/constants/sidebar.ts` (sidebar parsing helper)
- `src/components/layout/AppShell.tsx` (fetches sidebar + verifies markdown URLs)
- `src/lib/markdown-parser.ts` (parses frontmatter + quiz blocks)

