import { useState, useEffect } from "react"
import { Box, Home, Clock } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { SUBJECTS } from "@/constants/subjects"
import { parseSidebarJson } from "@/constants/sidebar"
import copy from "@/constants/ui-copy.json"
import { sitePath } from "@/lib/site-path"

export type SearchResultItem = {
  path: string
  label: string
  slug: string
  subjectId: string
  subjectLabel: string
  categoryTitle: string
}

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectSearchResult: (subjectId: string, path: string) => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectSearchResult,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [allItems, setAllItems] = useState<SearchResultItem[]>([])
  const [recentItems, setRecentItems] = useState<SearchResultItem[]>([])

  // Load recently visited items on mount and when modal opens
  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("lattice-recent-items")
      if (stored) {
        try {
          setRecentItems(JSON.parse(stored))
        } catch {
          setRecentItems([])
        }
      } else {
        setRecentItems([])
      }
      setSearchQuery("") // Clear search query when opening command palette
    }
  }, [open])

  // Load all items across all workspaces
  useEffect(() => {
    async function loadAllWorkspaces() {
      try {
        const loadedItems: SearchResultItem[] = []
        for (const subject of SUBJECTS) {
          const res = await fetch(subject.sidebarUrl)
          if (!res.ok) continue
          const data = await res.json()
          const parsed = parseSidebarJson(data)

          // Home/Root item for subject
          let homeResolvedUrl = ""
          const homeCandidates = [
            sitePath(`/content/${subject.id}/home.md`),
            sitePath(`/content/${subject.id}/index.md`)
          ]
          for (const url of homeCandidates) {
            try {
              const checkRes = await fetch(url, { method: "HEAD" })
              const contentType = checkRes.headers.get("content-type") || ""
              if (checkRes.ok && !contentType.includes("text/html")) {
                homeResolvedUrl = url
                break
              }
          } catch { /* A missing candidate is expected while probing content. */ }
          }

          if (homeResolvedUrl) {
            loadedItems.push({
              path: parsed.homePage.path,
              label: parsed.homePage.label || `${subject.label} Overview`,
              slug: "",
              subjectId: subject.id,
              subjectLabel: subject.label,
              categoryTitle: "Navigation",
            })
          }

          // Topics inside categories - verify if files exist (probed with ordering prefixes)
          for (const category of parsed.sidebarCategories) {
            const checkedCategoryItems = await Promise.all(
              category.items.map(async (item, index) => {
                const categorySegment = category.title
                const slugSegment = item.slug

                const twoDigitPrefix = String(index + 1).padStart(2, "0")
                const singleDigitPrefix = String(index + 1)

                const candidates = [
                  sitePath(`/content/${subject.id}/${categorySegment}/${slugSegment}.md`),
                  sitePath(`/content/${subject.id}/${categorySegment}/${twoDigitPrefix}-${slugSegment}.md`),
                  sitePath(`/content/${subject.id}/${categorySegment}/${singleDigitPrefix}-${slugSegment}.md`)
                ]

                for (const url of candidates) {
                  try {
                    const checkRes = await fetch(url, { method: "HEAD" })
                    const contentType = checkRes.headers.get("content-type") || ""
                    const isHtml = contentType.includes("text/html")
                    if (checkRes.ok && !isHtml) {
                      return {
                        ...item,
                        resolvedUrl: url
                      }
                    }
                  } catch { /* A missing candidate is expected while probing content. */ }
                }
                return null
              })
            )

            checkedCategoryItems.forEach((item) => {
              if (item) {
                loadedItems.push({
                  path: item.path,
                  label: item.label,
                  slug: item.slug || "",
                  subjectId: subject.id,
                  subjectLabel: subject.label,
                  categoryTitle: category.title,
                })
              }
            })
          }
        }
        setAllItems(loadedItems)
      } catch (err) {
        console.error("Failed to load workspace items for search:", err)
      }
    }
    loadAllWorkspaces()
  }, [])

  function handleSelectItem(item: SearchResultItem) {
    const updated = [
      item,
      ...recentItems.filter((r) => !(r.path === item.path && r.subjectId === item.subjectId)),
    ].slice(0, 5)

    localStorage.setItem("lattice-recent-items", JSON.stringify(updated))
    setRecentItems(updated)
    onSelectSearchResult(item.subjectId, item.path)
    onOpenChange(false)
  }

  // Group search results by workspace for nice presentation
  const groupedResults = SUBJECTS.reduce((acc, subject) => {
    const matched = allItems.filter((item) => item.subjectId === subject.id)
    if (matched.length > 0) {
      acc[subject.id] = {
        label: subject.label,
        items: matched,
      }
    }
    return acc;
  }, {} as Record<string, { label: string; items: SearchResultItem[] }>)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={copy.search.title}
      description={copy.search.description}
      className="border-zinc-200 bg-white text-zinc-950 shadow-2xl dark:border-white/[0.1] dark:bg-[#08090c]/96 dark:text-zinc-100"
    >
      <CommandInput
        placeholder={copy.search.placeholder}
        className="text-zinc-950 placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList className="max-h-[420px]">
        {searchQuery === "" ? (
          recentItems.length > 0 ? (
            <CommandGroup heading={copy.search.recentHeading}>
              {recentItems.map((item) => (
                <CommandItem
                  key={`recent-${item.subjectId}-${item.path}`}
                  value={`recent ${item.subjectLabel} ${item.categoryTitle} ${item.label}`}
                  onSelect={() => handleSelectItem(item)}
                  className="data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-zinc-50"
                >
                  <Clock className="size-4 text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-300">{item.label}</span>
                  <span className="ml-2 text-[10px] text-zinc-500">({item.subjectLabel})</span>
                  <CommandShortcut>{item.categoryTitle}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
              <div className="py-8 text-center text-sm text-zinc-500">
              {copy.search.emptyRecent}
            </div>
          )
        ) : (
          <>
            <CommandEmpty className="py-8 text-center text-sm text-zinc-500">
              {copy.search.noResults}
            </CommandEmpty>
            {Object.entries(groupedResults).map(([subjectId, group]) => (
              <CommandGroup key={subjectId} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={`search-${item.subjectId}-${item.path}`}
                    value={`${group.label} ${item.categoryTitle} ${item.label} ${item.slug}`}
                    onSelect={() => handleSelectItem(item)}
                    className="data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-zinc-50"
                  >
                    {item.path === "/" ? (
                      <Home className="size-4 text-zinc-500" />
                    ) : (
                      <Box className="size-4 text-zinc-400" />
                    )}
                    <span className="font-mono text-xs">{item.label}</span>
                    <CommandShortcut>{item.categoryTitle}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
