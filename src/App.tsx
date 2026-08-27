import { AppShell } from "@/components/layout/AppShell"
import { ThemeProvider } from "@/components/theme/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lattice-ui-theme">
      <AppShell />
    </ThemeProvider>
  )
}


export default App
