'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Edit, 
  Trash2, 
  BarChart2,
  CheckCircle,
  Clock,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

interface Page {
  id: number
  name: string
  slug: string
  status: string
  is_published: boolean
  view_count: number
  conversion_count: number
  conversionRate: string
  updated_at: string
  custom_domain?: string
}

export default function PagesManagementPage() {
  const { token, loading: authLoading } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchPages = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      let url = `${API_BASE_URL}/pages/?limit=100`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      if (statusFilter !== 'all') {
        url += `&is_published=${statusFilter === 'published'}`
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const response = await axios.get(url, config)
      // 使用真实数据
      const enrichedPages = response.data.map((p: any) => {
        const visits = p.view_count || 0
        const conversions = p.conversion_count || 0
        const rate = visits > 0 ? (conversions / visits * 100).toFixed(2) + '%' : '0.00%'
        
        return {
          ...p,
          visits: visits,
          conversions: conversions,
          conversionRate: rate,
          updatedAt: p.updated_at ? new Date(p.updated_at).toLocaleString() : '-'
        }
      })
      setPages(enrichedPages)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch pages:', err)
      setError(err.response?.data?.detail || '获取页面列表失败，请检查后端服务是否启动。')
    } finally {
      setLoading(false)
    }
  }, [token, searchTerm, statusFilter])

  useEffect(() => {
    if (!authLoading && token) {
      const timer = setTimeout(() => {
        fetchPages()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [authLoading, token, fetchPages])

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('确定要删除这个落地页吗？此操作不可恢复。')) return

    try {
      await axios.delete(`${API_BASE_URL}/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPages(pages.filter(p => p.id !== id))
    } catch (err) {
      alert('删除失败，请重试')
    }
  }

  const togglePublish = async (page: Page) => {
    if (!token) return
    try {
      const response = await axios.put(`${API_BASE_URL}/pages/${page.id}`, {
        is_published: !page.is_published
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPages(pages.map(p => p.id === page.id ? { ...p, is_published: response.data.is_published } : p))
    } catch (err) {
      alert('更新状态失败')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">落地页管理</h1>
          <p className="text-gray-500 mt-1">创建、编辑和管理您的智能推广落地页</p>
        </div>
        <Link 
          href="/admin/pages/create"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          创建新页面
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索页面名称..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-600"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
            <button 
              onClick={fetchPages}
              className="p-3 bg-gray-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
            <button 
              onClick={fetchPages}
              className="block mx-auto text-sm font-bold text-blue-600 hover:underline"
            >
              点击重试
            </button>
          </div>
        )}

        {!loading && !error && pages.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Globe className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">暂无页面数据</h3>
            <p className="text-gray-500 mt-1 mb-6">开始创建您的第一个智能落地页吧</p>
            <Link 
              href="/admin/pages/create"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              立即创建
            </Link>
          </div>
        )}

        {(loading && pages.length === 0) ? (
          <div className="p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">正在加载页面列表...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">页面信息</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">访问量 / 转化量</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">转化率</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          page.is_published ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{page.name}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <span className="truncate max-w-[200px]">lander.ai/p/{page.slug}</span>
                            <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => togglePublish(page)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                          page.is_published 
                            ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {page.is_published ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> 已发布</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> 草稿</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">{(page as any).visits?.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-1">{(page as any).conversions?.toLocaleString()} 转化</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="text-sm font-bold text-gray-900 mr-2">{(page as any).conversionRate}</div>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: (page as any).conversionRate }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link href={`/admin/dashboard?pageId=${page.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="数据统计">
                          <BarChart2 className="w-5 h-5" />
                        </Link>
                        <Link href={`/admin/pages/edit/${page.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="编辑页面">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="删除"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && !error && pages.length > 0 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">显示 1 到 {pages.length}，共 {pages.length} 个页面</p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm font-bold text-gray-400 bg-white border border-gray-200 rounded-xl cursor-not-allowed">上一页</button>
              <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">1</button>
              <button className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
