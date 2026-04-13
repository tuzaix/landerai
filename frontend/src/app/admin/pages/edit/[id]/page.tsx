'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Image as ImageIcon, 
  CheckSquare, 
  Layout, 
  FormInput,
  ChevronDown,
  ChevronUp,
  Settings,
  Globe,
  Loader2,
  Image as ImageIconPicker,
  ShieldAlert,
  Users
} from 'lucide-react'
import AssetPicker from '@/components/admin/AssetPicker'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

interface ComponentInstance {
  id: string
  type: string
  data: any
  isOpen: boolean
}

const COMPONENT_TEMPLATES: Record<string, any> = {
  hero: {
    title: '新产品发布',
    subtitle: '探索前所未有的科技魅力',
    buttonText: '立即购买',
    buttonLink: '#',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2070&auto=format&fit=crop'
  },
  features: {
    features: [
      { icon: 'Zap', title: '超高性能', description: '搭载最新一代处理器，运行速度提升 50%', imageUrl: '' },
      { icon: 'Shield', title: '安全可靠', description: '全方位隐私保护，您的数据只属于您', imageUrl: '' },
      { icon: 'Smile', title: '简单易用', description: '直观的用户界面，上手即用，无需学习成本', imageUrl: '' }
    ]
  },
  form: {
    fields: [
      { name: 'name', type: 'text', label: '姓名', required: true },
      { name: 'email', type: 'email', label: '邮箱地址', required: true },
      { name: 'phone', type: 'phone', label: '联系电话', required: false }
    ],
    submitText: '提交申请'
  },
  about: {
    title: '关于我们',
    content: '这里是关于我们公司的详细介绍。您可以描述公司的愿景、使命以及核心价值观。',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'
  },
  disclaimer: {
    title: '免责声明',
    content: '本落地页展示的所有信息仅供参考。我们保留随时更改内容而无需另行通知的权利。\n\n1. 数据准确性：我们尽力确保信息准确...\n2. 第三方链接：本页面可能包含指向外部网站的链接...'
  }
}

export default function EditPage() {
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [pageName, setPageName] = useState('加载中...')
  const [slug, setSlug] = useState('')
  const [components, setComponents] = useState<ComponentInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [assetPickerConfig, setAssetPickerConfig] = useState<{ id: string; field: string; value: string } | null>(null)

  const fetchPageData = useCallback(async () => {
    if (!token || !id) return
    try {
      setLoading(true)
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const response = await axios.get(`${API_BASE_URL}/pages/${id}`, config)
      const { name, slug, config: pageConfig } = response.data
      setPageName(name)
      setSlug(slug)
      setComponents(pageConfig.components || [])
    } catch (err) {
      console.error('Failed to fetch page:', err)
      alert('加载页面失败')
      router.push('/admin/pages')
    } finally {
      setLoading(false)
    }
  }, [id, token, router])

  useEffect(() => {
    if (!authLoading && token) {
      fetchPageData()
    }
  }, [authLoading, token, fetchPageData])

  const addComponent = (type: string) => {
    const newComponent: ComponentInstance = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data: JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[type] || {})),
      isOpen: true
    }
    setComponents([...components, newComponent])
  }

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id))
  }

  const toggleComponent = (id: string) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, isOpen: !c.isOpen } : c
    ))
  }

  const updateComponentData = (id: string, field: string, value: any) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, data: { ...c.data, [field]: value } } : c
    ))
  }

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newComponents = [...components]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newComponents.length) return
    
    [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]]
    setComponents(newComponents)
  }

  const handleSave = async () => {
    if (!token) return
    try {
      setSaving(true)
      const payload = {
        name: pageName,
        config: { components }
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.put(`${API_BASE_URL}/pages/${id}`, payload, config)
      
      alert('修改已保存！')
      router.push('/admin/pages')
    } catch (err) {
      console.error('Failed to update page:', err)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">正在载入页面配置...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/admin/pages" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <div>
            <input 
              type="text" 
              value={pageName} 
              onChange={(e) => setPageName(e.target.value)}
              className="text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0 w-64"
              placeholder="请输入页面名称"
            />
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <Globe className="w-3 h-3 mr-1" />
              <span>lander.ai/p/</span>
              <span className="text-blue-500 font-medium">{slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            href={`/p/${slug}`} 
            target="_blank"
            className="inline-flex items-center px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Eye className="w-4 h-4 mr-2" />
            查看预览
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            保存修改
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-73px)]">
        {/* 左侧组件列表 */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-8 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">添加组件</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => addComponent('hero')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Layout className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">Hero 头部</span>
              </button>
              <button 
                onClick={() => addComponent('features')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">卖点列表</span>
              </button>
              <button 
                onClick={() => addComponent('form')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FormInput className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">表单组件</span>
              </button>
              <button 
                onClick={() => addComponent('about')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">关于我们</span>
              </button>
              <button 
                onClick={() => addComponent('disclaimer')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">免责声明</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 中间编辑区域 */}
        <main className="flex-1 overflow-y-auto p-12 bg-gray-100/50">
          <div className="max-w-3xl mx-auto space-y-6">
            {components.map((comp, index) => (
              <div key={comp.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden group">
                <div 
                  className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleComponent(comp.id)}
                >
                  <div className="flex items-center">
                    <div className="flex flex-col mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        disabled={index === 0}
                        onClick={(e) => { e.stopPropagation(); moveComponent(index, 'up'); }}
                        className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-400"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={index === components.length - 1}
                        onClick={(e) => { e.stopPropagation(); moveComponent(index, 'down'); }}
                        className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-400"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider mr-3">
                      #{index + 1} {comp.type}
                    </span>
                    <h4 className="text-sm font-bold text-gray-800">
                      {comp.type === 'hero' ? '头部 Hero' : 
                       comp.type === 'features' ? '卖点展示' : 
                       comp.type === 'form' ? '信息收集表单' :
                       comp.type === 'about' ? '关于我们' :
                       comp.type === 'disclaimer' ? '免责声明' : '未知组件'}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {comp.isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {comp.isOpen && (
                  <div className="p-8 space-y-6 animate-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                    {comp.type === 'hero' && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Type className="w-3 h-3 mr-1" /> 主标题
                          </label>
                          <input 
                            type="text" 
                            value={comp.data.title || ''}
                            onChange={(e) => updateComponentData(comp.id, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Type className="w-3 h-3 mr-1" /> 副标题
                          </label>
                          <textarea 
                            value={comp.data.subtitle || ''}
                            onChange={(e) => updateComponentData(comp.id, 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium h-24"
                          ></textarea>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Plus className="w-3 h-3 mr-1" /> 按钮文字
                          </label>
                          <input 
                            type="text" 
                            value={comp.data.buttonText || ''}
                            onChange={(e) => updateComponentData(comp.id, 'buttonText', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Globe className="w-3 h-3 mr-1" /> 按钮链接 (外链)
                          </label>
                          <input 
                            type="text" 
                            value={comp.data.buttonLink || ''}
                            onChange={(e) => updateComponentData(comp.id, 'buttonLink', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <ImageIconPicker className="w-3 h-3 mr-1" /> 背景图片 URL
                          </label>
                          <div className="flex space-x-3">
                            <input 
                              type="text" 
                              value={comp.data.imageUrl || ''}
                              onChange={(e) => updateComponentData(comp.id, 'imageUrl', e.target.value)}
                              className="flex-1 px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                              placeholder="输入图片 URL 或从素材库选择"
                            />
                            <button 
                              onClick={() => setAssetPickerConfig({ id: comp.id, field: 'imageUrl', value: comp.data.imageUrl || '' })}
                              className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors flex items-center whitespace-nowrap"
                            >
                              <ImageIconPicker className="w-4 h-4 mr-2" />
                              素材库
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {comp.type === 'features' && (
                      <div className="space-y-6">
                        {(comp.data.features || []).map((feature: any, i: number) => (
                          <div key={i} className="p-6 bg-gray-50 rounded-2xl relative group/item">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              {/* 卖点图片选择器 */}
                              <div className="md:col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">卖点图片</label>
                                <div 
                                  onClick={() => setAssetPickerConfig({ id: comp.id, field: `features.${i}.imageUrl`, value: feature.imageUrl || '' })}
                                  className="aspect-square bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group/img"
                                >
                                  {feature.imageUrl ? (
                                    <img src={feature.imageUrl} alt={feature.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIconPicker className="w-6 h-6 text-gray-300 group-hover/img:text-blue-500" />
                                  )}
                                </div>
                              </div>
                              
                              {/* 卖点内容编辑 */}
                              <div className="md:col-span-3 space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">卖点标题</label>
                                  <input 
                                    type="text" 
                                    value={feature.title}
                                    onChange={(e) => {
                                      const newFeatures = [...comp.data.features]
                                      newFeatures[i].title = e.target.value
                                      updateComponentData(comp.id, 'features', newFeatures)
                                    }}
                                    className="w-full bg-white font-bold text-gray-900 border border-gray-100 rounded-lg px-3 py-2 focus:border-blue-500 outline-none transition-all"
                                    placeholder="输入标题"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">描述内容</label>
                                  <textarea 
                                    value={feature.description}
                                    onChange={(e) => {
                                      const newFeatures = [...comp.data.features]
                                      newFeatures[i].description = e.target.value
                                      updateComponentData(comp.id, 'features', newFeatures)
                                    }}
                                    className="w-full bg-white text-sm text-gray-900 border border-gray-100 rounded-lg px-3 py-2 h-20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="详细描述..."
                                  ></textarea>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const newFeatures = comp.data.features.filter((_: any, idx: number) => idx !== i)
                                updateComponentData(comp.id, 'features', newFeatures)
                              }}
                              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newFeatures = [...(comp.data.features || []), { icon: 'Zap', title: '新卖点', description: '新描述', imageUrl: '' }]
                            updateComponentData(comp.id, 'features', newFeatures)
                          }}
                          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 mr-2" /> 添加新卖点
                        </button>
                      </div>
                    )}

                    {comp.type === 'form' && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-500 block">表单字段配置</label>
                          {(comp.data.fields || []).map((field: any, i: number) => (
                            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                              <GripVertical className="w-4 h-4 text-gray-300" />
                              <div className="flex-1 text-sm font-bold text-gray-700">{field.label}</div>
                              <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100">{field.type}</div>
                              {field.required && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">必填</span>}
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">管理字段设置</button>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">提交按钮文字</label>
                          <input 
                            type="text" 
                            value={comp.data.submitText || ''}
                            onChange={(e) => updateComponentData(comp.id, 'submitText', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {comp.type === 'about' && (
                      <div className="space-y-6">
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Type className="w-3 h-3 mr-1" /> 关于标题
                          </label>
                          <input 
                            type="text" 
                            value={comp.data.title || ''}
                            onChange={(e) => updateComponentData(comp.id, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Type className="w-3 h-3 mr-1" /> 详细介绍内容
                          </label>
                          <textarea 
                            value={comp.data.content || ''}
                            onChange={(e) => updateComponentData(comp.id, 'content', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium h-48"
                          ></textarea>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <ImageIconPicker className="w-3 h-3 mr-1" /> 关于图片 URL
                          </label>
                          <div className="flex space-x-3">
                            <input 
                              type="text" 
                              value={comp.data.imageUrl || ''}
                              onChange={(e) => updateComponentData(comp.id, 'imageUrl', e.target.value)}
                              className="flex-1 px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                              placeholder="输入图片 URL 或从素材库选择"
                            />
                            <button 
                              onClick={() => setAssetPickerConfig({ id: comp.id, field: 'imageUrl', value: comp.data.imageUrl || '' })}
                              className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors flex items-center whitespace-nowrap"
                            >
                              <ImageIconPicker className="w-4 h-4 mr-2" />
                              素材库
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {comp.type === 'disclaimer' && (
                      <div className="space-y-6">
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <ShieldAlert className="w-3 h-3 mr-1" /> 免责声明标题
                          </label>
                          <input 
                            type="text" 
                            value={comp.data.title || ''}
                            onChange={(e) => updateComponentData(comp.id, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Type className="w-3 h-3 mr-1" /> 免责声明内容
                          </label>
                          <textarea 
                            value={comp.data.content || ''}
                            onChange={(e) => updateComponentData(comp.id, 'content', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium h-64"
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button 
              onClick={() => addComponent('hero')}
              className="w-full py-12 border-4 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-300 hover:text-blue-400 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <Plus className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg">添加新组件</span>
            </button>
          </div>
        </main>
      </div>

      {/* 素材选择器弹窗 */}
      {assetPickerConfig && (
        <AssetPicker 
          currentValue={assetPickerConfig.value}
          onSelect={(url) => {
            if (assetPickerConfig.field.startsWith('features.')) {
              const index = parseInt(assetPickerConfig.field.split('.')[1])
              const comp = components.find(c => c.id === assetPickerConfig.id)
              if (comp && comp.data.features) {
                const newFeatures = [...comp.data.features]
                newFeatures[index].imageUrl = url
                updateComponentData(assetPickerConfig.id, 'features', newFeatures)
              }
            } else {
              updateComponentData(assetPickerConfig.id, assetPickerConfig.field, url)
            }
            setAssetPickerConfig(null)
          }}
          onClose={() => setAssetPickerConfig(null)}
        />
      )}
    </div>
  )
}
