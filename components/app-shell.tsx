"use client"

import { AppSidebar } from "@/components/app-sidebar"

interface AppShellProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      <main className="lg:pl-64">
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-6 pt-12 lg:pt-0">
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
