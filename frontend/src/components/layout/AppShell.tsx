import { motion } from "motion/react"
import {
  Eye,
  History,
  Lock,
  LogOut,
  Shield,
  Upload,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/layout/PageTransition"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/encode", label: "Encode", icon: Upload },
  { to: "/decode", label: "Decode", icon: Eye },
  { to: "/history", label: "History", icon: History },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="grid-bg flex min-h-screen">
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass flex w-64 shrink-0 flex-col border-r border-border"
      >
        <div className="flex items-center gap-3 border-b border-border p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Stegano</p>
            <p className="text-xs text-muted-foreground">LSB Steganography</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="relative">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-emerald-300"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </motion.aside>

      <main className="flex flex-1 flex-col overflow-auto p-8">
        <PageTransition />
      </main>
    </div>
  )
}
