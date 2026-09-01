import { sitePath } from "@/lib/site-path"

export interface Subject {
  id: string
  label: string
  sidebarUrl: string
}

export const SUBJECTS: Subject[] = [
  { id: "Template", label: "Lattice Template", sidebarUrl: sitePath("/content/Template_Sidebar.json") },
];
