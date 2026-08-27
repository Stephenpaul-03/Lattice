export type NavigationPageData = {
  label: string
  path: string
  slug?: string
  layout?: string
  resolvedUrl?: string
}

export type SidebarItemData = NavigationPageData & {
  label: string
  path: string
  slug: string
  layout?: string
}

export type SidebarCategoryData = {
  title: string
  items: SidebarItemData[]
}
