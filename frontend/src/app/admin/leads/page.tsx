'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  MoreVertical, 
  Mail, 
  Phone, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  X
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

interface Lead {
  id: number
  name: string
  email: string
  phone: string
  message: string
  page_id: number
  page_name: string
  created_at: string
  status?: string
}

function LeadsContent() {
  const { token, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const pageId = searchParams?.get('pageId')
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageName, setPageName] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      let url = `${API_BASE_URL}/leads/?limit=100`
      if (pageId) {
        url = `${API_BASE_URL}/leads/page/${pageId}?limit=100`
        // 获取页面名称
        axios.get(`${API_BASE_URL}/pages/${pageId}`, config)
          .then(res => setPageName(res.data.name))
          .catch(() => setPageName('未知页面'))
      } else {
        setPageName(null)
      }

      const response = await axios.get(url, config)
      setLeads(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch leads:', err)
      setError(err.response?.data?.detail || '获取线索失败，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }, [token, pageId])

  useEffect(() => {
    if (!authLoading && token) {
      fetchLeads()
    }
  }, [authLoading, token, fetchLeads])

  // 简单的本地搜索过滤
  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm) ||
    lead.message?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {pageName ? `线索管理: ${pageName}` : '线索管理'}
            </h1>
            {pageName && (
              <a href="/admin/leads" className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </a>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {pageName ? `查看页面 "${pageName}" 收集到的客户信息` : '查看和跟进从落地页收集到的客户信息'}
          </p>
        </div>
        <button className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all active:scale-95">
          <Download className="w-5 h-5 mr-2 text-blue-500" />
          导出 CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索姓名、邮箱、电话或留言内容..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchLeads}
              className="p-3 bg-gray-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-bold">{error}</p>
            <button onClick={fetchLeads} className="mt-4 text-blue-600 font-bold hover:underline">点击重试</button>
          </div>
        )}

        {!loading && !error && filteredLeads.length === 0 && (
          <div className="p-20 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">暂无匹配的线索数据</p>
          </div>
        )}

        {loading && leads.length === 0 ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">正在加载线索数据...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">客户姓名</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">来源页面</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">留言摘要</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">提交时间</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {lead.name ? lead.name[0] : '?'}
                        </div>
                        <div className="ml-4 font-bold text-gray-900">{lead.name || '匿名'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer group/item">
                            <Mail className="w-3 h-3 mr-2 text-gray-400 group-hover/item:text-blue-500" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer group/item">
                            <Phone className="w-3 h-3 mr-2 text-gray-400 group-hover/item:text-blue-500" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                        {lead.page_name || '未知页面'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start max-w-[200px]">
                        <MessageSquare className="w-4 h-4 mr-2 text-gray-300 flex-shrink-0 mt-1" />
                        <p className="text-sm text-gray-500 line-clamp-2">{lead.message || '无留言'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-500 font-medium">
                        {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredLeads.length > 0 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">显示 1 到 {filteredLeads.length}，共 {leads.length} 条线索</p>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:border-gray-200 border border-transparent rounded-lg transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all">
                1
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:border-gray-200 border border-transparent rounded-lg transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LeadsManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <LeadsContent />
    </Suspense>
  )
}
