import { useEffect, useState } from "react"
import { Monitor } from "lucide-react"
import { marked } from "marked"

import {
  parseSidebarJson,
} from "@/constants/sidebar"
import { SUBJECTS, type Subject } from "@/constants/subjects"
import { AppContextMenu } from "@/components/layout/AppContextMenu"
import { BreadcrumbBar } from "@/components/layout/BreadcrumbBar"
import { CommandPalette } from "@/components/dialogs/CommandPalette"
import { ContactModal } from "@/components/dialogs/ContactModal"
import { NotFoundPage } from "@/components/layout/NotFoundPage"
import { GlobalHomePage } from "@/components/layout/GlobalHomePage"
import { WorkspaceLoader } from "@/components/layout/WorkspaceLoader"
import { PropertyRenderer } from "@/components/property/PropertyRenderer"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNavbar } from "@/components/layout/TopNavbar"
import { OutlineSidebar } from "@/components/layout/OutlineSidebar"
import type { NavigationPageData, SidebarCategoryData, SidebarItemData } from "@/types/navigation"
import { sitePath, siteRoot } from "@/lib/site-path"

const initialActivePath = "/"

function parseUrl(): { subjectId: string; pagePath: string } | { isNotFound: true } | null {
  if (typeof window === "undefined") return null
  const pathname = window.location.pathname
  if (!pathname || pathname === "/" || pathname === siteRoot) return null

  const root = siteRoot.endsWith("/") ? siteRoot.slice(0, -1) : siteRoot
  const segment = pathname.startsWith(`${root}/`)
    ? pathname.substring(root.length + 1)
    : pathname.substring(1)
  const matchedSubject = SUBJECTS.find((s) =>
    segment.toLowerCase().startsWith(s.id.toLowerCase() + "-")
  )

  if (matchedSubject) {
    const slug = segment.substring(matchedSubject.id.length + 1)
    return { subjectId: matchedSubject.id, pagePath: slug }
  }
  return { isNotFound: true }
}

function getCurrentPage(
  activePath: string,
  homePage: NavigationPageData,
  sidebarCategories: SidebarCategoryData[]
) {
  if (activePath === "/" || activePath === homePage.path) {
    return { currentPage: homePage, parentLabel: undefined }
  }

  for (const category of sidebarCategories) {
    const item = category.items.find((page) => page.path === activePath)

    if (item) {
      return { currentPage: item, parentLabel: category.title }
    }
  }

  return {
    currentPage: {
      label: "Overview",
      path: "/",
    } satisfies NavigationPageData,
    parentLabel: undefined,
  }
}

export function AppShell() {
  const initialUrl = parseUrl()
  const [activeSubject, setActiveSubject] = useState<Subject>(() => {
    if (initialUrl && "subjectId" in initialUrl) {
      const sub = SUBJECTS.find((s) => s.id === initialUrl.subjectId)
      if (sub) return sub
    }
    return SUBJECTS[0]
  })
  const [activePath, setActivePath] = useState(initialActivePath)
  const [pendingSlug, setPendingSlug] = useState<string | null>(() => {
    return initialUrl && "pagePath" in initialUrl ? initialUrl.pagePath : null
  })
  const [isNotFound, setIsNotFound] = useState(() => Boolean(initialUrl && "isNotFound" in initialUrl))
  const [isGlobalHome, setIsGlobalHome] = useState(() => initialUrl === null)
  const [loadingWorkspace, setLoadingWorkspace] = useState<Subject | null>(null)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [activeSectionTitle, setActiveSectionTitle] = useState<string>()

  // Collapsible States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768,
  )
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState(false)
  const [splashCoords, setSplashCoords] = useState<{ x: number; y: number } | null>(null)

  const handleSelectSubject = (
    subject: Subject,
    event: React.MouseEvent
  ) => {
    if (isGlobalHome) {
      if (loadingWorkspace) return
      setLoadingWorkspace(subject)
      window.setTimeout(() => {
        setIsGlobalHome(false)
        setPendingSlug("home")
        setActiveSubject(subject)
        setLoadingWorkspace(null)
      }, 850)
      return
    }

    if (subject.id === activeSubject.id) return

    setSplashCoords({ x: event.clientX, y: event.clientY })

    window.setTimeout(() => {
      setActiveSubject(subject)
      setPendingSlug("home")
    }, 400)

    window.setTimeout(() => {
      setSplashCoords(null)
    }, 1000)
  }

  const handleSelectPath = (path: string) => {
    setIsGlobalHome(false)
    setActivePath(path)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarCollapsed(true)
      setIsOutlineCollapsed(true)
    }
  }

  const handleGoToGlobalHome = () => {
    window.history.pushState({}, "", siteRoot)
    setActiveSubject(SUBJECTS[0])
    setActivePath("/")
    setPendingSlug(null)
    setIsNotFound(false)
    setIsGlobalHome(true)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true)
        setIsOutlineCollapsed(true)
      } else {
        setIsSidebarCollapsed(false)
        setIsOutlineCollapsed(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Outline States
  const [headings, setHeadings] = useState<string[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)

  // Welcome overlay and modal states
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    return localStorage.getItem("lattice-welcomed") !== "true"
  })

  // System menu preference state
  const [useSystemMenu, setUseSystemMenu] = useState(() => {
    return localStorage.getItem("lattice-use-system-menu") === "true"
  })

  const handleCloseWelcome = () => {
    localStorage.setItem("lattice-welcomed", "true")
    setIsWelcomeOpen(false)
  }

  const handleSwitchToSystemMenu = () => {
    localStorage.setItem("lattice-use-system-menu", "true")
    setUseSystemMenu(true)
  }

  const handleRestoreCustomMenu = () => {
    localStorage.setItem("lattice-use-system-menu", "false")
    setUseSystemMenu(false)
  }

  const [navData, setNavData] = useState<{
    homePage: NavigationPageData
    sidebarCategories: SidebarCategoryData[]
    sidebarItems: SidebarItemData[]
  }>({
    homePage: { label: "Overview", path: "/" },
    sidebarCategories: [],
    sidebarItems: [],
  })

  // Handle browser Back/Forward navigation
  useEffect(() => {
    function handlePopState() {
      const urlInfo = parseUrl()
      if (urlInfo && "subjectId" in urlInfo) {
        const sub = SUBJECTS.find((s) => s.id === urlInfo.subjectId)
        if (sub) {
          setActiveSubject(sub)
          setPendingSlug(urlInfo.pagePath)
          setIsNotFound(false)
          setIsGlobalHome(false)
        }
      } else if (urlInfo?.isNotFound) {
        setIsNotFound(true)
        setIsGlobalHome(false)
      } else {
        setActiveSubject(SUBJECTS[0])
        setPendingSlug("home")
        setIsNotFound(false)
        setIsGlobalHome(true)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Sync URL pushState when subject or path changes
  useEffect(() => {
    let slug = "home"
    const currentItem = navData.sidebarItems.find((item) => item.path === activePath)
    if (currentItem && currentItem.slug) {
      slug = currentItem.slug
    }

    const expectedPathname = sitePath(`/${activeSubject.id}-${slug}`)
    if (isNotFound || pendingSlug || (window.location.pathname === siteRoot && isGlobalHome)) return
    if (window.location.pathname !== expectedPathname) {
      window.history.pushState(
        { subjectId: activeSubject.id, pagePath: slug },
        "",
        expectedPathname
      )
    }
  }, [activeSubject, activePath, navData, isNotFound, pendingSlug, isGlobalHome])

  useEffect(() => {
    if (isNotFound && !pendingSlug) return
    fetch(activeSubject.sidebarUrl)
      .then((res) => res.json())
      .then(async (data) => {
        const parsed = parseSidebarJson(data)

        // Resolve active subject home page
        let homePageResolved = parsed.homePage
        const homeCandidates = [
          sitePath(`/content/${activeSubject.id}/home.md`),
          sitePath(`/content/${activeSubject.id}/index.md`)
        ]
        for (const url of homeCandidates) {
          try {
            const checkRes = await fetch(url, { method: "HEAD" })
            const contentType = checkRes.headers.get("content-type") || ""
            if (checkRes.ok && !contentType.includes("text/html")) {
              homePageResolved = {
                ...parsed.homePage,
                resolvedUrl: url
              }
              break
            }
          } catch {
            // ignore
          }
        }

        // Dynamically verify if the markdown file exists for each item
        const checkedCategories = await Promise.all(
          parsed.sidebarCategories.map(async (category) => {
            const checkedItems = await Promise.all(
              category.items.map(async (item, index) => {
                const categorySegment = category.title
                const slugSegment = item.slug
                
                const twoDigitPrefix = String(index + 1).padStart(2, "0")
                const singleDigitPrefix = String(index + 1)
                
                const candidates = [
                  sitePath(`/content/${activeSubject.id}/${categorySegment}/${slugSegment}.md`),
                  sitePath(`/content/${activeSubject.id}/${categorySegment}/${twoDigitPrefix}-${slugSegment}.md`),
                  sitePath(`/content/${activeSubject.id}/${categorySegment}/${singleDigitPrefix}-${slugSegment}.md`)
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
                  } catch {
                    // ignore
                  }
                }
                return null
              })
            )

            return {
              ...category,
              items: checkedItems.filter((i): i is typeof i & object => i !== null),
            }
          })
        )

        const filteredCategories = checkedCategories.filter((cat) => cat.items.length > 0)
        const filteredItems = filteredCategories.flatMap((cat) => cat.items)

        // Resolve page target path using pendingSlug
        let targetPath = homePageResolved.path
        if (pendingSlug) {
          if (pendingSlug !== "home") {
            const foundItem = filteredItems.find((item) => item.slug === pendingSlug)
            if (!foundItem) {
              setNavData({ homePage: homePageResolved, sidebarCategories: filteredCategories, sidebarItems: filteredItems })
              setIsNotFound(true)
              setPendingSlug(null)
              return
            }
            targetPath = foundItem.path
          }
          setPendingSlug(null)
        } else {
          const exists = filteredItems.some((item) => item.path === activePath)
          if (!exists) {
            targetPath = homePageResolved.path
          } else {
            targetPath = activePath
          }
        }

        setNavData({
          homePage: homePageResolved,
          sidebarCategories: filteredCategories,
          sidebarItems: filteredItems,
        })
        setIsNotFound(false)
        setActivePath(targetPath)
      })
      .catch((err) => {
        console.error("Failed to load sidebar configuration:", err)
      })
  }, [activePath, activeSubject, pendingSlug, isNotFound])

  const { currentPage, parentLabel } = getCurrentPage(activePath, navData.homePage, navData.sidebarCategories)

  // Track scroll position to update active heading highlight
  useEffect(() => {
    const mainEl = document.querySelector("main")
    if (!mainEl) return

    function handleScroll() {
      const headingElements = Array.from(document.querySelectorAll(".markdown-body h2"))
      if (headingElements.length === 0) return

      let currentActive: string | null = null
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect()
        // If it crosses a threshold from the top
        if (rect.top <= 120) {
          currentActive = el.id
        } else {
          break
        }
      }
      if (currentActive) {
        setActiveHeadingId(currentActive)
      } else if (headingElements[0]) {
        setActiveHeadingId(headingElements[0].id)
      }
    }

    mainEl.addEventListener("scroll", handleScroll)
    // Run once initially to capture layout
    handleScroll()

    return () => mainEl.removeEventListener("scroll", handleScroll)
  }, [headings])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setIsCommandOpen((isOpen) => !isOpen)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const fetchCleanContent = async () => {
    if (!currentPage.resolvedUrl) return null
    try {
      const res = await fetch(currentPage.resolvedUrl)
      const text = await res.text()
      let cleanText = text.replace(/^---([\s\S]*?)---/, "").trim()
      cleanText = cleanText.replace(/:::quiz([\s\S]*?):::/g, "").trim()
      return cleanText
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const handleDownloadMD = async () => {
    const content = await fetchCleanContent()
    if (!content) return
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentPage.slug || "page"}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async () => {
    const content = await fetchCleanContent()
    if (!content) return
    const html = await marked.parse(content)
    const printIframe = document.createElement("iframe")
    printIframe.style.position = "fixed"
    printIframe.style.right = "0"
    printIframe.style.bottom = "0"
    printIframe.style.width = "0"
    printIframe.style.height = "0"
    printIframe.style.border = "0"
    document.body.appendChild(printIframe)

    const doc = printIframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(`
        <html>
          <head>
            <title>${currentPage.label}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                color: #111;
                padding: 2rem;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { font-size: 2.2rem; margin-bottom: 1.5rem; }
              h2 { font-size: 1.6rem; margin-top: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
              pre { background: #f4f4f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
              code { font-family: monospace; font-size: 0.9em; background: #f4f4f5; padding: 0.2rem 0.4rem; border-radius: 4px; }
              ul, ol { padding-left: 1.5rem; }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `)
      doc.close()

      setTimeout(() => {
        printIframe.contentWindow?.focus()
        printIframe.contentWindow?.print()
        document.body.removeChild(printIframe)
      }, 500)
    }
  }

  function handleScrollToHeading(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const layoutContent = (
    <div className="h-dvh overflow-hidden bg-zinc-50 text-zinc-950 antialiased dark:bg-[#050608] dark:text-zinc-100">
      <TopNavbar
        onOpenCommand={() => setIsCommandOpen(true)}
        activeSubject={activeSubject}
        onSelectSubject={handleSelectSubject}
        onOpenContact={() => setIsContactOpen(true)}
      />
      <div className="flex h-[calc(100dvh-4rem)] min-h-0 min-w-0 overflow-hidden flex-col">
        <BreadcrumbBar
          currentPage={currentPage}
          parentLabel={parentLabel}
          categories={navData.sidebarCategories}
          activePath={activePath}
          onGoHome={handleGoToGlobalHome}
          activeSectionTitle={activeSectionTitle}
          onSelectPath={handleSelectPath}
          activeSubject={activeSubject}
          onSelectSubject={handleSelectSubject}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOutlineCollapsed={isOutlineCollapsed}
          onToggleOutline={() => setIsOutlineCollapsed(!isOutlineCollapsed)}
          headings={headings}
          onDownloadPDF={handleDownloadPDF}
          onDownloadMD={handleDownloadMD}
        />
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {!isSidebarCollapsed && (
            <div 
              className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-in-out cursor-pointer" 
              onClick={() => setIsSidebarCollapsed(true)}
            />
          )}
          {!isOutlineCollapsed && (
            <div 
              className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-in-out cursor-pointer" 
              onClick={() => setIsOutlineCollapsed(true)}
            />
          )}
          <Sidebar
            categories={navData.sidebarCategories}
            activePath={activePath}
            onSelectItem={handleSelectPath}
            isCollapsed={isSidebarCollapsed}
          />
          <main className="touch-scroll-y mobile-bottom-space min-h-0 min-w-0 flex-1 overflow-y-auto bg-zinc-50 [scrollbar-color:rgb(161_161_170)_transparent] [scrollbar-width:thin] dark:bg-[#050608] dark:[scrollbar-color:rgb(63_63_70)_transparent]">
            <PropertyRenderer
              onActiveSectionChange={setActiveSectionTitle}
              activeSubject={activeSubject}
              currentPage={currentPage}
              parentLabel={parentLabel}
              fallback={<NotFoundPage />}
              onHeadingsLoaded={setHeadings}
            />
          </main>

          {/* Outline Sidebar placed on the right next to main content */}
          {currentPage.path !== "/" && (
            <OutlineSidebar
              headings={headings}
              activeHeadingId={activeHeadingId}
              onSelectHeading={handleScrollToHeading}
              isCollapsed={isOutlineCollapsed}
              currentPage={currentPage}
              onDownloadPDF={handleDownloadPDF}
              onDownloadMD={handleDownloadMD}
            />
          )}
        </div>
      </div>
      {/* Floating Restore Pill for Custom Context Menu */}
      {useSystemMenu && (
        <button
          onClick={handleRestoreCustomMenu}
          className="fixed bottom-4 right-4 z-[90] flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Monitor className="size-3.5 text-indigo-500" />
          Restore Custom Context Menu
        </button>
      )}
    </div>
  )

  return (
    <>
      <CommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onSelectSearchResult={(subjectId, path) => {
          const targetSubject = SUBJECTS.find((s) => s.id === subjectId)
          if (!targetSubject) return
          setIsGlobalHome(false)
          setPendingSlug(path === "/" ? "home" : path.split("/")[2] || "home")
          setActiveSubject(targetSubject)
          setActivePath("/")
        }}
      />
      <ContactModal
        open={isContactOpen}
        onOpenChange={setIsContactOpen}
      />
      {isNotFound ? (
        <div className="h-screen overflow-y-auto bg-zinc-50 text-zinc-950 dark:bg-[#050608] dark:text-zinc-100">
          <NotFoundPage />
        </div>
      ) : isGlobalHome ? (
        <GlobalHomePage
          onSelectWorkspace={handleSelectSubject}
          showWelcome={isWelcomeOpen}
          onDismissWelcome={handleCloseWelcome}
          onOpenContact={() => setIsContactOpen(true)}
        />
      ) : (
        <AppContextMenu
          currentPage={currentPage}
          categories={navData.sidebarCategories}
          onSelectPath={handleSelectPath}
          onOpenCommand={() => setIsCommandOpen(true)}
          onSwitchToSystemMenu={handleSwitchToSystemMenu}
          disabled={useSystemMenu}
        >
          {layoutContent}
        </AppContextMenu>
      )}
      {splashCoords && (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
          <div
            className="project-splash-circle"
            style={{
              left: `${splashCoords.x}px`,
              top: `${splashCoords.y}px`,
              backgroundColor: "var(--background)",
            }}
          />
        </div>
      )}
      {loadingWorkspace && <WorkspaceLoader subject={loadingWorkspace} />}
    </>
  )
}
