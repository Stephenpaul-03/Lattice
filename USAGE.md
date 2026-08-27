# Cascade Usage

## Adding a new Subject (top-level menu) and its lessons

A **subject** is the top-level menu selection in the app. It is wired up from three places:

1. **Subject registration:** `src/constants/subjects.ts`
2. **Menu definition (sidebar JSON):** `public/content/<subjectId>_Sidebar.json`
3. **Lesson content (markdown):** `public/content/<subjectId>/...md`

---

## 1) Register the subject
Edit:

- `src/constants/subjects.ts`

Add an entry:

```ts
{ id: "NEW_ID", label: "New Subject Label", sidebarUrl: "/content/NEW_SIDEBAR.json" }
```

`id` should match the folder you’ll create under `public/content/`.

---

## 2) Create the sidebar JSON
Create:

- `public/content/NEW_SIDEBAR.json`

It should include:

- `home`: `{ label, path }`
- `categories[]`: each category has:
  - `title` (string)
  - `topics`: map of `topicLabel -> path` (or `{ path, layout }`)

Example topic value forms:

```json
"font-family": "/typography/font-family"
```

```json
"font-family": { "path": "/typography/font-family", "layout": "split" }
```

---

## 3) Add markdown for home + each lesson topic
### Subject home
The app checks these for the home markdown (in order):

- `public/content/<subjectId>/home.md`
- `public/content/<subjectId>/index.md`

### Topic markdown resolution
For each sidebar topic, the app verifies that a markdown file exists by trying candidate URLs.

It uses:
- `category.title` as a folder segment candidate
- `topic.slug` derived from the `topic.path`

Then it checks (in order):

1. `public/content/<subjectId>/<CategoryTitle>/<slug>.md`
2. `public/content/<subjectId>/<CategoryTitle>/01-<slug>.md`
3. `public/content/<subjectId>/<CategoryTitle>/1-<slug>.md`

**Common working example**

If your sidebar includes:
- `category.title`: `Typography`
- topic `path`: `/typography/font-family`

Create:

- `public/content/<subjectId>/Typography/font-family.md`

---

## Optional: layouts and quizzes
### Layout
You can set `layout` on a topic entry in the sidebar JSON.

The markdown parser also supports frontmatter:

```md
---
layout: split
title: Font Family
---

Your lesson content...
```

### Quiz blocks
Quiz syntax supported by the markdown parser:

Multiple `:::quiz` blocks can be added to one markdown page; they appear as a guided, multi-question concept check.

```md
:::quiz
question: Which one is correct?
options:
- Option A
- Option B (correct)
explanation: Because ...
:::
```

---

## Quick checklist
1. Add `NEW_ID` to `src/constants/subjects.ts`
2. Add `public/content/NEW_SIDEBAR.json`
3. Add home: `public/content/NEW_ID/home.md` (or `index.md`)
4. For each topic, add markdown under:
   - `public/content/NEW_ID/<CategoryTitle>/<slug>.md`
   - (fallback: `01-<slug>.md` or `1-<slug>.md`)
