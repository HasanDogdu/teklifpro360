import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // PREVIEW MODE: skip auth check for demo screenshots
  const previewMode = process.env.PREVIEW_MODE === '1'
  if (!user && !previewMode) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar email={user?.email ?? 'demo@teklifpro.dev'} />
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
