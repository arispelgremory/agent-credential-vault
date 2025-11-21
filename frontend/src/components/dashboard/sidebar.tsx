"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Key, BotIcon as Robot, FileText, Settings, LogOut, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: MessageCircle,
  },
  // {
  //   name: "Credentials",
  //   href: "/dashboard/credentials",
  //   icon: Key,
  // },
  {
    name: "AI Agents / MCP Servers",
    href: "/dashboard/agents",
    icon: Robot,
  },
  {
    name: "Activity Log",
    href: "/dashboard/activity",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden bg-background/80 backdrop-blur-sm transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-metamynd-purple/20 transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center justify-center">
              <Image
                src="/images/metamynd-full-logo.png"
                alt="MetaMynd Logo"
                width={150}
                height={40}
                className="object-contain"
              />
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden text-gray-700" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href ? "bg-gradient-metamynd text-white" : "text-gray-700 hover:bg-purple-50",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-purple-50"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
