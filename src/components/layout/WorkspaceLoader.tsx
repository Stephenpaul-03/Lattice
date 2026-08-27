import { LoaderCircle } from "lucide-react"

import iconDark from "@/assets/icon-dark.png"
import iconLight from "@/assets/icon-light.png"
import copy from "@/constants/ui-copy.json"
import { useTheme } from "@/components/theme/theme-context"
import type { Subject } from "@/constants/subjects"

type WorkspaceLoaderProps = {
  subject: Subject
}

export function WorkspaceLoader({ subject }: WorkspaceLoaderProps) {
  const { theme } = useTheme()
  const loaderCopy = copy.workspaceLoader.workspaces[subject.id as keyof typeof copy.workspaceLoader.workspaces]
  const logoSrc = theme === "dark" ? iconDark : iconLight

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-zinc-50 px-6 text-zinc-950 dark:bg-[#050608] dark:text-zinc-100" role="status" aria-live="polite">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative flex size-24 items-center justify-center rounded-[2rem] border border-zinc-200 bg-white shadow-xl dark:border-white/[0.1] dark:bg-white/[0.04]">
          <span className="absolute inset-0 rounded-[2rem] border border-zinc-400/40 animate-ping dark:border-white/25" />
          <img src={logoSrc} alt="" className="relative size-12 rounded-xl" aria-hidden="true" />
        </div>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{copy.workspaceLoader.status}</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{loaderCopy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{loaderCopy.description}</p>
        <LoaderCircle className="mt-8 size-5 animate-spin text-zinc-500" aria-hidden="true" />
      </div>
    </div>
  )
}
