'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Image, 
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuth } from '@/context/AuthContext'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { name: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '落地页管理', href: '/admin/pages', icon: FileText },
  { name: '线索管理', href: '/admin/leads', icon: Users },
  { name: '素材库', href: '/admin/assets', icon: Image },
  { name: '系统设置', href: '/admin/settings', icon: Settings },
]

const superAdminItems = [
  { name: '租户管理', href: '/admin/super', icon: ShieldCheck },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const isSuperAdmin = user?.role === 'super_admin' && user?.email === 'super@landerai.com'

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500 tracking-tighter">LanderAI</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Smart Landing Page</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname ? pathname.startsWith(item.href) : false
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mr-3 transition-all duration-300",
                isActive ? "text-white scale-110" : "text-gray-500 group-hover:text-white"
              )} />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              )}
            </Link>
          )
        })}

        {isSuperAdmin && (
          <>
            <div className="px-4 pt-6 pb-2">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">超级管理</p>
            </div>
            {superAdminItems.map((item) => {
              const isActive = pathname ? pathname.startsWith(item.href) : false
              const Icon = item.icon
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                    isActive 
                      ? "bg-purple-600 text-white shadow-xl shadow-purple-600/20" 
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mr-3 transition-all duration-300",
                    isActive ? "text-white scale-110" : "text-gray-500 group-hover:text-white"
                  )} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                  )}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="p-6 border-t border-gray-800/50">
        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">退出登录</span>
        </button>
      </div>
    </aside>
  )
}
