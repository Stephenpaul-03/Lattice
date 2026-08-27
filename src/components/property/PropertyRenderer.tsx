import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { marked, type Tokens } from "marked"
import Prism from "prismjs"
import "prismjs/components/prism-css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/themes/prism-tomorrow.css"

import type { Subject } from "@/constants/subjects"
import type { NavigationPageData } from "@/types/navigation"

import { DocumentLayout } from "@/components/property/layouts/DocumentLayout"
import { SplitLayout } from "@/components/property/layouts/SplitLayout"
import { parseMarkdown, type QuizData, type Frontmatter } from "@/lib/markdown-parser"
import { QuizCard } from "@/components/property/layouts/QuizCard"


type PropertyRendererProps = {
  onActiveSectionChange: (title?: string) => void
  activeSubject: Subject
  currentPage: NavigationPageData
  parentLabel?: string
  fallback: ReactNode
  onHeadingsLoaded: (headings: string[]) => void
}

export function PropertyRenderer({
  onActiveSectionChange,
  activeSubject,
  currentPage,
  parentLabel,
  fallback,
  onHeadingsLoaded,
}: PropertyRendererProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<QuizData[]>([])
  const [frontmatter, setFrontmatter] = useState<Frontmatter>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onActiveSectionChange(undefined)
    setHtmlContent(null)
    setQuizzes([])
    setFrontmatter({})
    setLoading(true)

    const categorySegment = parentLabel ? parentLabel : ""
    const slugSegment = currentPage.slug ? currentPage.slug : "home"
    const base = `/content/${activeSubject.id}/${categorySegment ? categorySegment + "/" : ""}`

    async function fetchContent() {
      if (currentPage.resolvedUrl) {
        const res = await fetch(currentPage.resolvedUrl)
        const contentType = res.headers.get("content-type") || ""
        if (res.ok && !contentType.includes("text/html")) {
          return res.text()
        }
      }

      // Fallback candidate check
      const candidates = [
        `${slugSegment}.md`,
        ...Array.from({ length: 15 }, (_, i) => `${String(i + 1).padStart(2, "0")}-${slugSegment}.md`),
        ...Array.from({ length: 15 }, (_, i) => `${i + 1}-${slugSegment}.md`)
      ]

      for (const candidate of candidates) {
        const url = `${base}${candidate}`
        try {
          const res = await fetch(url)
          const contentType = res.headers.get("content-type") || ""
          if (res.ok && !contentType.includes("text/html")) {
            return res.text()
          }
        } catch {
          // ignore
        }
      }
      throw new Error("MD file not found")
    }

    fetchContent()
      .then((text) => {
        const { frontmatter: fm, content: markdownBody, quizzes: parsedQuizzes } = parseMarkdown(text)
        setFrontmatter(fm)
        setQuizzes(parsedQuizzes)

        const headingsList = markdownBody
          .split("\n")
          .filter((line) => line.startsWith("## "))
          .map((line) => line.replace("## ", "").trim())
        onHeadingsLoaded(headingsList)

        const renderer = new marked.Renderer()
        
        // 1. Heading Renderer (Scroll Sync IDs)
        renderer.heading = function ({ text: textVal, depth: depthVal }: Tokens.Heading) {
          if (depthVal === 2) {
            const id = textVal.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return `<h2 id="${id}" class="scroll-mt-24">${textVal}</h2>\n`
          }
          return `<h${depthVal}>${textVal}</h${depthVal}>\n`
        }

        // 2. Code Renderer (PrismJS Syntax Highlighting)
        renderer.code = function ({ text: codeText, lang = "" }: Tokens.Code) {
          let highlighted = codeText
          if (lang && Prism.languages[lang]) {
            try {
              highlighted = Prism.highlight(codeText, Prism.languages[lang], lang)
            } catch (e) {
              console.error("Prism highlight error:", e)
            }
          }
          return `<pre><code class="language-${lang}">${highlighted}</code></pre>\n`
        }

        // Images in lesson markdown are intentionally centered and responsive.
        renderer.image = function ({ href, title, text }: Tokens.Image) {
          const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          const titleAttribute = title ? ` title="${escape(title)}"` : ""
          return `<img class="markdown-image" src="${escape(href)}" alt="${escape(text)}"${titleAttribute} loading="lazy" />`
        }

        const parsed = marked.parse(markdownBody, { renderer })
        setHtmlContent(parsed as string)
        setLoading(false)
      })
      .catch(() => {
        onHeadingsLoaded([])
        setHtmlContent(null)
        setQuizzes([])
        setFrontmatter({})
        setLoading(false)
      })
  }, [activeSubject, currentPage, parentLabel, onActiveSectionChange, onHeadingsLoaded])

  if (loading) {
    return <div className="flex h-64 items-center justify-center" aria-label="Loading"><LoaderCircle className="size-5 animate-spin text-zinc-400" /></div>
  }

  if (htmlContent) {
    const activeLayout = typeof frontmatter.layout === "string" ? frontmatter.layout : currentPage.layout
    const quizNode = quizzes.length > 0 ? <QuizCard key={currentPage.path} quizzes={quizzes} /> : null

    if (activeLayout === "split") {
      return (
        <SplitLayout
          htmlContent={htmlContent}
          quizNode={quizNode}
        />
      )
    }

    return <DocumentLayout htmlContent={htmlContent} quizNode={quizNode} />
  }


  return fallback
}
