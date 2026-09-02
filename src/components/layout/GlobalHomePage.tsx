import { useMemo, useState } from "react"
import { ArrowRight, BookOpen, Compass, Search, Sparkles, X } from "lucide-react"

import iconDark from "@/assets/icon-dark.png"
import iconLight from "@/assets/icon-light.png"
import copy from "@/constants/ui-copy.json"
import { SUBJECTS, type Subject } from "@/constants/subjects"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { useTheme } from "@/components/theme/theme-context"
import type { MouseEvent } from "react"

type GlobalHomePageProps = {
  onSelectWorkspace: (subject: Subject, event: MouseEvent<HTMLButtonElement>) => void
  showWelcome: boolean
  onDismissWelcome: () => void
  onOpenContact: () => void
}

const pointIcons = { book: BookOpen, compass: Compass, sparkles: Sparkles } as const

export function GlobalHomePage({ onSelectWorkspace, showWelcome, onDismissWelcome, onOpenContact }: GlobalHomePageProps) {
  const { theme } = useTheme()
  const [query, setQuery] = useState("")
  const logoSrc = theme === "dark" ? iconDark : iconLight
  const filteredSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return SUBJECTS
    return SUBJECTS.filter((subject) => `${subject.label} ${subject.id}`.toLowerCase().includes(normalizedQuery))
  }, [query])

  return (
    <div className="touch-scroll-y h-dvh overflow-y-auto bg-zinc-50 text-zinc-950 antialiased dark:bg-[#050608] dark:text-zinc-100">
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-5 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#07080b]/78 md:px-8">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="" className="size-8" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Lattice</p>
            <p className="text-[11px] text-zinc-500"><button type="button" onClick={onOpenContact} className="font-semibold text-zinc-700 underline decoration-dotted underline-offset-2 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50" aria-label="Contact Stephen">Stephen</button>’s notes & learnings</p>
          </div>
        </div>
        <ModeToggle />
      </header>

      <main className="home-reveal mx-auto w-full max-w-6xl px-5 pt-16 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-8 md:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{copy.globalHome.eyebrow}</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">{copy.globalHome.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-500 dark:text-zinc-400">I’m <button type="button" onClick={onOpenContact} className="font-semibold text-zinc-700 underline decoration-dotted underline-offset-2 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50" aria-label="Contact Stephen">Stephen</button>, and {copy.globalHome.description}</p>
          <label className="mx-auto mt-8 flex h-12 w-full max-w-xl items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 text-left shadow-sm focus-within:border-zinc-400 dark:border-white/[0.1] dark:bg-white/[0.04] dark:focus-within:border-white/30">
            <Search className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.globalHome.searchPlaceholder} className="w-full bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
          </label>
        </section>

        {showWelcome && <section className="mx-auto mt-12 max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm dark:border-white/[0.1] dark:bg-white/[0.03] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-zinc-200"><Sparkles className="size-4" /></div>
              <div><h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{copy.welcome.title} <button type="button" onClick={onOpenContact} className="underline decoration-dotted underline-offset-4 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300" aria-label="Contact Stephen">Stephen</button>.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">{copy.welcome.description} {copy.welcome.intro}</p></div>
            </div>
            <button type="button" onClick={onDismissWelcome} aria-label="Dismiss welcome message" className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-white/[0.07] dark:hover:text-zinc-50"><X className="size-4" /></button>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">{copy.welcome.points.map((point) => { const Icon = pointIcons[point.icon as keyof typeof pointIcons]; return <div key={point.title} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.025]"><Icon className="size-4 text-zinc-600 dark:text-zinc-300" /><h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{point.title}</h3><p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{point.description}</p></div> })}</div>
        </section>}

        <section className="mt-16">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.globalHome.workspaceHeading}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{filteredSubjects.length} available</span>
          </div>
          {filteredSubjects.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredSubjects.map((subject) => <button key={subject.id} type="button" onClick={(event) => onSelectWorkspace(subject, event)} className="home-card group flex min-h-52 flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-zinc-400 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/25 dark:hover:bg-white/[0.05]"><div className="flex items-start justify-between gap-4"><img src={logoSrc} alt="" className="size-10 rounded-xl" aria-hidden="true" /><span className="rounded-full border border-zinc-200 px-2 py-1 font-mono text-[10px] text-zinc-500 dark:border-white/[0.1]">Notes</span></div><div className="mt-auto"><h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{subject.label}</h3><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{copy.globalHome.workspaces[subject.id as keyof typeof copy.globalHome.workspaces]}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">{copy.globalHome.openLabel}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span></div></button>)}</div> : <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-white/[0.12]">{copy.globalHome.noResults}</div>}
        </section>
      </main>
    </div>
  )
}
