import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useState } from 'react'

export default function ProtectedLayout() {
  const { token } = useAuthStore()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
          data-testid="mobile-sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/50 via-blue-50/10 to-indigo-50/20">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="animate-fade-in max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}