import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Search,
  Library,
  Clock,
  Heart,
  ListMusic,
  Disc3,
  User,
  Music2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Button } from '@/components/ui/Button'

interface NavItem {
  icon: React.ElementType
  label: string
  to: string
}

const mainNav: NavItem[] = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Search, label: 'Search', to: '/search' },
]

const libraryNav: NavItem[] = [
  { icon: Clock, label: 'Recently Added', to: '/recently-added' },
  { icon: ListMusic, label: 'Recently Played', to: '/recently-played' },
  { icon: Heart, label: 'Favorites', to: '/favorites' },
  { icon: Music2, label: 'Songs', to: '/songs' },
  { icon: Disc3, label: 'Albums', to: '/albums' },
  { icon: User, label: 'Artists', to: '/artists' },
  { icon: Library, label: 'Playlists', to: '/playlists' },
]

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const navigate = useNavigate()

  if (!sidebarOpen) return null

  const width = sidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass flex flex-col h-full border-r border-muse-glass-border z-20 shrink-0"
      style={{ width }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-16 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-lg tracking-tight overflow-hidden whitespace-nowrap gradient-text"
              >
                Muse
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav sections */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 px-3 pb-4">
          {/* Main nav */}
          <nav className="flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <SidebarNavLink key={item.to} item={item} collapsed={sidebarCollapsed} />
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-muse-glass-border mx-1" />

          {/* Library header + add */}
          <div className="flex items-center justify-between px-2">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-muse-text-muted uppercase tracking-wider"
                >
                  Your Library
                </motion.span>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate('/import')}
              aria-label="Add music"
              className={cn(
                'shrink-0 text-muse-text-muted hover:text-muse-text',
                sidebarCollapsed && 'mx-auto',
              )}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Library nav */}
          <nav className="flex flex-col gap-0.5">
            {libraryNav.map((item) => (
              <SidebarNavLink key={item.to} item={item} collapsed={sidebarCollapsed} />
            ))}
          </nav>

          {/* Settings at bottom of library */}
          <SidebarNavLink
            item={{ icon: Settings, label: 'Settings', to: '/settings' }}
            collapsed={sidebarCollapsed}
          />
        </div>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="flex items-center justify-center px-3 py-3 border-t border-muse-glass-border shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-muse-text-muted hover:text-muse-text"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  )
}

function SidebarNavLink({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg transition-all duration-150 group',
          collapsed ? 'justify-center px-2 py-2.5 mx-auto' : 'px-3 py-2.5 mx-0',
          isActive
            ? 'bg-muse-accent-subtle text-muse-accent'
            : 'text-muse-text-secondary hover:text-muse-text hover:bg-muse-bg-hover',
        )
      }
    >
      <Icon
        className={cn(
          'w-5 h-5 shrink-0 transition-colors',
        )}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-medium truncate overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}
