'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Shield, 
  Mail, 
  Globe, 
  Save, 
  Loader2,
  Lock,
  Building
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

export default function SettingsPage() {
  const { user: currentUser, token, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'team' | 'profile'>('team')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 团队设置状态
  const [teamData, setTeamData] = useState({
    name: '',
    notify_email: ''
  })
  
  // 个人资料状态
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !token) return
      
      try {
        setLoading(true)
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }
        const [teamRes, userRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/settings/team/${currentUser.team_id}`, config),
          axios.get(`${API_BASE_URL}/settings/user/${currentUser.id}`, config)
        ])
        
        setTeamData({
          name: teamRes.data.name,
          notify_email: teamRes.data.notify_email || ''
        })
        
        setUserData({
          email: userRes.data.email,
          password: '',
          confirmPassword: ''
        })
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (!authLoading && token && currentUser) {
      fetchData()
    }
  }, [currentUser, token, authLoading])

  const handleTeamSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !token) return
    
    try {
      setSaving(true)
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.put(`${API_BASE_URL}/settings/team/${currentUser.team_id}`, teamData, config)
      alert('团队设置已更新')
    } catch (err) {
      console.error('Failed to save team settings:', err)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !token) return
    
    if (userData.password && userData.password !== userData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }
    
    try {
      setSaving(true)
      const payload: any = { email: userData.email }
      if (userData.password) payload.password = userData.password
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.put(`${API_BASE_URL}/settings/user/${currentUser.id}`, payload, config)
      alert('个人资料已更新')
      setUserData({ ...userData, password: '', confirmPassword: '' })
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 font-medium">正在加载系统设置...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">系统设置</h1>
        <p className="text-gray-500 mt-1">管理团队偏好、通知设置和您的个人资料</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
        {/* 左侧导航 */}
        <div className="w-64 border-r border-gray-50 p-4 bg-gray-50/30">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'team' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Building className="w-4 h-4 mr-3" />
              团队设置
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-3" />
              个人资料
            </button>
          </nav>
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 p-8">
          {activeTab === 'team' ? (
            <form onSubmit={handleTeamSave} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-500" />
                  团队信息
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">团队名称</label>
                    <input 
                      type="text" 
                      value={teamData.name}
                      onChange={(e) => setTeamData({...teamData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                      placeholder="例如：海外营销部"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">通知接收邮箱</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        value={teamData.notify_email}
                        onChange={(e) => setTeamData({...teamData, notify_email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                        placeholder="admin@example.com"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 italic">新的线索提交后将发送提醒邮件到此地址</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  保存团队设置
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                  基本资料
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">电子邮箱</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-orange-500" />
                  安全设置
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">修改密码</label>
                    <input 
                      type="password" 
                      value={userData.password}
                      onChange={(e) => setUserData({...userData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                      placeholder="留空则不修改"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">确认新密码</label>
                    <input 
                      type="password" 
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                      placeholder="再次输入新密码"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  保存个人资料
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
