'use client'

import React from 'react'
import AdminSidebar from '@/components/admin/Sidebar'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  
  const userInitial = user?.email?.[0].toUpperCase() || 'A'
  const userRole = user?.role === 'super_admin' ? '超级管理员' : '管理员'

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">配置管理后台</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-medium">{userRole}: {user?.email || '加载中...'}</span>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200 shadow-sm">
                {userInitial}
              </div>
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
