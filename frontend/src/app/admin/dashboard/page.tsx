'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  MousePointer2, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Loader2,
  Globe,
  AlertCircle,
  X
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

function DashboardContent() {
  const { token, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const pageId = searchParams?.get('pageId')
  
  const [statsSummary, setStatsSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [pageName, setPageName] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      
      // 设置请求头 (确保在 token 准备好后发送)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      // 如果有 pageId，获取该页面的统计数据和页面信息
      if (pageId) {
        const [statsRes, leadsRes, pageRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stats/stats/${pageId}`, config),
          axios.get(`${API_BASE_URL}/leads/page/${pageId}?limit=5`, config),
          axios.get(`${API_BASE_URL}/pages/${pageId}`, config)
        ])

        // 统一数据格式
        const statsData = statsRes.data
        setStatsSummary({
          total_visits: statsData.visits,
          total_conversions: statsData.conversions,
          total_leads: statsData.leads,
          conversion_rate: ((statsData.conversions / statsData.visits) * 100 || 0).toFixed(2),
          active_pages: 1 // 单页面模式下设为 1
        })
        
        setPageName(pageRes.data.name)
        
        setRecentLeads(leadsRes.data.map((l: any) => ({
          name: l.name || '匿名',
          email: l.email || '-',
          time: formatTimeAgo(l.created_at),
          source: l.page_name || '当前页面'
        })))
      } else {
        // 全局统计模式
        const [statsRes, leadsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stats/summary`, config),
          axios.get(`${API_BASE_URL}/leads/?limit=5`, config)
        ])

        setStatsSummary(statsRes.data)
        setPageName(null)
        setRecentLeads(leadsRes.data.map((l: any) => ({
          name: l.name || '匿名',
          email: l.email || '-',
          time: formatTimeAgo(l.created_at),
          source: l.page_name || '未知来源'
        })))
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.response?.data?.detail || '无法加载仪表盘数据，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [token])

  // 辅助函数：格式化时间
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    
    const hours = Math.floor(diff / 3600000)
    if (hours < 24) return `${hours}小时前`
    
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  useEffect(() => {
    if (!authLoading && token) {
      fetchDashboardData()
    }
  }, [authLoading, token, fetchDashboardData])

  const statsCards = [
    { 
      name: '总访问量', 
      value: statsSummary?.total_visits?.toLocaleString() || '0', 
      change: '+12.5%', 
      trend: 'up',
      icon: MousePointer2,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50'
    },
    { 
      name: '总转化量', 
      value: statsSummary?.total_conversions?.toLocaleString() || '0', 
      change: '+8.2%', 
      trend: 'up',
      icon: Zap,
      color: 'bg-green-500',
      lightColor: 'bg-green-50'
    },
    { 
      name: '平均转化率', 
      value: (statsSummary?.conversion_rate || '0') + '%', 
      change: '-0.4%', 
      trend: 'down',
      icon: BarChart3,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50'
    },
    { 
      name: '累积线索', 
      value: statsSummary?.total_leads?.toLocaleString() || '0', 
      change: '+15.3%', 
      trend: 'up',
      icon: Users,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50'
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {pageName ? `页面统计: ${pageName}` : '数据概览'}
            </h1>
            {pageName && (
              <Link href="/admin/dashboard" className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </Link>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {pageName ? `查看页面 "${pageName}" 的详细数据分析` : '查看系统整体运行情况和核心指标'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchDashboardData}
            disabled={loading || authLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            刷新数据
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.lightColor} group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="ml-1 w-3 h-3" /> : <ArrowDownRight className="ml-1 w-3 h-3" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            最近访问趋势
          </h3>
          <div className="h-64 flex items-end justify-between px-2">
            {[40, 60, 45, 80, 55, 70, 90, 65, 50, 75, 85, 95].map((height, i) => (
              <div key={i} className="w-6 bg-blue-100 rounded-t-lg relative group">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-blue-600" 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-xs text-gray-400 font-medium">
            <span>04-01</span>
            <span>04-06</span>
            <span>04-12</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-500" />
            活跃页面状态
          </h3>
          <div className="flex items-center justify-center h-64">
             <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{statsSummary?.active_pages || 0}</div>
                <p className="text-gray-500 font-medium text-sm">当前已发布页面</p>
                <div className="mt-6">
                  <Link href="/admin/pages" className="text-sm font-bold text-blue-600 hover:underline">
                    管理所有页面 &rarr;
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 最近线索 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-500" />
            最近收到的线索
          </h3>
          <Link href={pageId ? `/admin/leads?pageId=${pageId}` : "/admin/leads"} className="text-sm font-bold text-blue-600 hover:underline">
            查看全部 &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">客户</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">来源页面</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">提交时间</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLeads.map((lead, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {lead.name[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-bold text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{lead.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{lead.time}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-600 uppercase tracking-wider">
                      待跟进
                    </span>
                  </td>
                </tr>
              ))}
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                    暂无最近线索
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
