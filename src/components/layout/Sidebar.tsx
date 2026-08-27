import { Home } from "lucide-react"
import { SidebarCategory } from "@/components/layout/SidebarCategory"
import { cn } from "@/lib/utils"
import type {
  SidebarCategoryData,
} from "@/types/navigation"

type SidebarProps = {
  categories: SidebarCategoryData[]
  activePath: string
  onSelectItem: (path: string) => void
  isCollapsed: boolean
}

export function Sidebar({
  categories,
  activePath,
  onSelectItem,
  isCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full shrink-0 overflow-hidden border-r border-zinc-200 bg-white/92 backdrop-blur-xl transition-[width,opacity] duration-300 ease-in-out dark:border-white/[0.08] dark:bg-[#07080b]/92",
        "max-md:fixed max-md:top-16 max-md:bottom-0 max-md:left-0 max-md:z-50 max-md:h-[calc(100vh-4rem)]",
        isCollapsed ? "w-0 border-r-0 opacity-0 pointer-events-none" : "w-[260px] opacity-100"
      )}
    >

      <div className="flex h-full w-[260px] flex-col">
        <nav
          aria-label="Workspace navigation"
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4 [scrollbar-color:rgb(161_161_170)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgb(63_63_70)_transparent]"
        >
          {/* Home Link */}
          <div className="space-y-1">
            <button
              type="button"
              aria-current={activePath === "/" ? "page" : undefined}
              onClick={() => onSelectItem("/")}
              className={cn(
                "group flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm font-medium transition-colors duration-200 cursor-pointer",
                activePath === "/"
                  ? "bg-zinc-100 text-zinc-950 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-100/[0.08] dark:text-zinc-50 dark:ring-white/10"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.045] dark:hover:text-zinc-100",
              )}
            >
              <Home className="size-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <span>Overview</span>
            </button>
          </div>

          {categories.map((category) => (
            <SidebarCategory
              key={category.title}
              category={category}
              activePath={activePath}
              onSelectItem={onSelectItem}
            />
          ))}
        </nav>
      </div>
    </aside>
  )
}
