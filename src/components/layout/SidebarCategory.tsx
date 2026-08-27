import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { SidebarItem } from "@/components/layout/SidebarItem"
import { cn } from "@/lib/utils"
import type { SidebarCategoryData } from "@/types/navigation"

type SidebarCategoryProps = {
  category: SidebarCategoryData
  activePath: string
  onSelectItem: (path: string) => void
}

export function SidebarCategory({
  category,
  activePath,
  onSelectItem,
}: SidebarCategoryProps) {
  const [isOpen, setIsOpen] = useState(true)
  const contentId = `sidebar-category-${category.title
    .toLowerCase()
    .replace(/\s+/g, "-")}`

  return (
    <section className="space-y-1.5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-8 w-full items-center justify-between rounded-md px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.035] dark:hover:text-zinc-300"
      >
        <span>{category.title}</span>
        <span className="ml-auto mr-2 rounded-full border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] leading-none tracking-normal text-zinc-500 dark:border-white/[0.08] dark:bg-white/[0.035]">
          {category.items.length}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            !isOpen && "-rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1 pl-2">
            {category.items.map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                isActive={activePath === item.path}
                onSelect={onSelectItem}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
