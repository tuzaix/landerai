'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Edit2, 
  Save, 
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Building,
  Mail
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

interface Team {
  id: number
  name: string
  notify_email: string
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'expired' | 'suspended'
  expires_at: string | null
  created_at: string
}

interface TeamStats {
  pages_count: number
  leads_count: number
}

export default function SuperAdminPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showAddModal, setShowUploadModal] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    notify_email: '',
    plan_type: 'free',
    status: 'active',
    expires_at: ''
  })
  const [teamStats, setTeamStats] = useState<Record<number, TeamStats>>({})
  const [saving, setSaving] = useState(false)

  const fetchTeams = useCallback(async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      
      const res = await axios.get(`${API_BASE_URL}/super-admin/teams`, config)
      setTeams(res.data)
      
      // 并行获取所有团队的统计数据
      const statsPromises = res.data.map((team: Team) => 
        axios.get(`${API_BASE_URL}/super-admin/teams/${team.id}/stats`, config)
          .then(r => ({ id: team.id, stats: r.data }))
          .catch(() => ({ id: team.id, stats: { pages_count: 0, leads_count: 0 } }))
      )
      
      const statsResults = await Promise.all(statsPromises)
      const statsMap: Record<number, TeamStats> = {}
      statsResults.forEach(item => {
        statsMap[item.id] = item.stats
      })
      setTeamStats(statsMap)
    } catch (err) {
      console.error('Failed to fetch teams:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!authLoading && token && user?.role === 'super_admin') {
      fetchTeams()
    }
  }, [authLoading, token, user, fetchTeams])

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    try {
      setSaving(true)
      const payload = {
        ...newTeam,
        expires_at: newTeam.expires_at ? new Date(newTeam.expires_at).toISOString() : null
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.post(`${API_BASE_URL}/super-admin/teams`, payload, config)
      setShowUploadModal(false)
      alert(`租户添加成功！\n\n默认管理员账号：${newTeam.notify_email}\n初始密码：admin123\n\n请告知租户及时修改密码。`)
      setNewTeam({
        name: '',
        notify_email: '',
        plan_type: 'free',
        status: 'active',
        expires_at: ''
      })
      fetchTeams()
    } catch (err) {
      console.error('Add team failed:', err)
      alert('添加失败')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam || !token) return
    
    try {
      setSaving(true)
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.put(`${API_BASE_URL}/super-admin/teams/${editingTeam.id}`, {
        plan_type: editingTeam.plan_type,
        status: editingTeam.status,
        expires_at: editingTeam.expires_at
      }, config)
      setEditingTeam(null)
      fetchTeams()
    } catch (err) {
      console.error('Update failed:', err)
      alert('更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTeam = async (id: number, name: string) => {
    if (!token || !window.confirm(`确定要删除租户 "${name}" 吗？此操作将永久删除该团队的所有用户、落地页、线索和素材，且无法撤销！`)) return
    
    try {
      setLoading(true)
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.delete(`${API_BASE_URL}/super-admin/teams/${id}`, config)
      fetchTeams()
    } catch (err) {
      console.error('Delete team failed:', err)
      alert('删除失败')
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadge = (plan: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-600',
      basic: 'bg-blue-100 text-blue-600',
      pro: 'bg-purple-100 text-purple-600',
      enterprise: 'bg-orange-100 text-orange-600'
    }
    return <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${styles[plan as keyof typeof styles]}`}>{plan}</span>
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-600',
      expired: 'bg-red-100 text-red-600',
      suspended: 'bg-gray-400 text-white'
    }
    return <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${styles[status as keyof typeof styles]}`}>{status}</span>
  }

  if (user?.role !== 'super_admin' || user?.email !== 'super@landerai.com') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">权限不足</h2>
        <p className="text-gray-500 mt-2">只有指定的超级管理员账号可以访问此页面</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
            <ShieldCheck className="w-8 h-8 mr-3 text-purple-600" />
            租户管理 (超级管理员)
          </h1>
          <p className="text-gray-500 mt-1">监控和管理所有多租户团队的订阅状态、使用情况和到期时间</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加租户
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">团队信息</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">版本方案</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">使用情况</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">状态 / 到期时间</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-500 font-medium">加载租户数据中...</p>
                  </td>
                </tr>
              ) : teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-lg shadow-sm">
                        {team.name[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-black text-gray-900">{team.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{team.notify_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {getPlanBadge(team.plan_type)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-xs text-gray-500 font-bold">
                        <FileText className="w-3.5 h-3.5 mr-1 text-blue-500" />
                        {teamStats[team.id]?.pages_count || 0} 页面
                      </div>
                      <div className="flex items-center text-xs text-gray-500 font-bold">
                        <Users className="w-3.5 h-3.5 mr-1 text-green-500" />
                        {teamStats[team.id]?.leads_count || 0} 线索
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      {getStatusBadge(team.status)}
                      <div className="flex items-center text-[10px] font-bold text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {team.expires_at ? new Date(team.expires_at).toLocaleDateString() : '永久有效'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setEditingTeam(team)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        title="编辑订阅"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="删除租户"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">管理订阅: {editingTeam.name}</h3>
              <button onClick={() => setEditingTeam(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTeam} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">版本方案</label>
                <select 
                  value={editingTeam.plan_type}
                  onChange={(e) => setEditingTeam({...editingTeam, plan_type: e.target.value as any})}
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                >
                  <option value="free">Free (免费版)</option>
                  <option value="basic">Basic (基础版)</option>
                  <option value="pro">Pro (专业版)</option>
                  <option value="enterprise">Enterprise (企业版)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">账户状态</label>
                <select 
                  value={editingTeam.status}
                  onChange={(e) => setEditingTeam({...editingTeam, status: e.target.value as any})}
                  className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                >
                  <option value="active">Active (正常)</option>
                  <option value="expired">Expired (已到期)</option>
                  <option value="suspended">Suspended (已停用)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">到期时间</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    value={editingTeam.expires_at ? editingTeam.expires_at.split('T')[0] : ''}
                    onChange={(e) => setEditingTeam({...editingTeam, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="flex-1 py-4 text-sm font-black text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 text-sm font-black text-white bg-purple-600 rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {saving ? '正在保存...' : '保存更改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 添加租户弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">添加新租户</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddTeam} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">团队名称</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    placeholder="例如：环球营销团队"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">通知接收邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    value={newTeam.notify_email}
                    onChange={(e) => setNewTeam({...newTeam, notify_email: e.target.value})}
                    placeholder="admin@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">版本方案</label>
                  <select 
                    value={newTeam.plan_type}
                    onChange={(e) => setNewTeam({...newTeam, plan_type: e.target.value as any})}
                    className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">账户状态</label>
                  <select 
                    value={newTeam.status}
                    onChange={(e) => setNewTeam({...newTeam, status: e.target.value as any})}
                    className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                  >
                    <option value="active">正常</option>
                    <option value="expired">已到期</option>
                    <option value="suspended">已停用</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">到期时间 (选填)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    value={newTeam.expires_at}
                    onChange={(e) => setNewTeam({...newTeam, expires_at: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-4 text-sm font-black text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 text-sm font-black text-white bg-purple-600 rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                  {saving ? '正在添加...' : '立即创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
