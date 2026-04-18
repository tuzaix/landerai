'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Zap,
  ShieldAlert,
  Users
} from 'lucide-react'
import AssetPicker from '@/components/admin/AssetPicker'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL } from '@/config'

// 组件数据接口定义
interface HeroData {
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  imageUrl: string
}

interface FeatureItem {
  icon: string
  title: string
  description: string
  imageUrl?: string
}

interface FeaturesData {
  features: FeatureItem[]
}

interface FormField {
  name: string
  type: string
  label: string
  required: boolean
}

interface FormData {
  fields: FormField[]
  submitText: string
}

type ComponentData = HeroData | FeaturesData | FormData

interface ComponentInstance {
  id: string
  type: string
  data: any // 使用 any 简化处理，实际开发中建议使用联合类型
  isOpen: boolean
}

// 组件模板配置
const COMPONENT_TEMPLATES: Record<string, any> = {
  hero: {
    title: '新产品发布',
    subtitle: '探索前所未有的科技魅力',
    buttonText: '立即购买',
    buttonLink: '#',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2070&auto=format&fit=crop',
    layout: 'split'
  },
  features: {
    features: [
      { icon: 'Zap', title: '超高性能', description: '搭载最新一代处理器，运行速度提升 50%', imageUrl: '' },
      { icon: 'Shield', title: '安全可靠', description: '全方位隐私保护，您的数据只属于您', imageUrl: '' },
      { icon: 'Smile', title: '简单易用', description: '直观的用户界面，上手即用，无需学习成本', imageUrl: '' }
    ],
    layout: 'grid'
  },
  testimonials: {
    testimonials: [
      { name: '张经理', role: 'CEO, TechCorp', avatar: 'https://i.pravatar.cc/150?u=1', content: '这是我用过最好的落地页生成系统，极大地提升了我们的转化率。' },
      { name: '李总', role: 'Marketing Director', avatar: 'https://i.pravatar.cc/150?u=2', content: 'AI 生成的内容非常专业，适配性也很强。' }
    ],
    layout: 'grid'
  },
  cta: {
    title: '准备好开启您的增长之旅了吗？',
    subtitle: '现在加入，享受 30 天免费试用。',
    buttonText: '立即开始',
    buttonLink: '#',
    layout: 'standard'
  },
  form: {
    fields: [
      { name: 'name', type: 'text', label: '姓名', required: true },
      { name: 'email', type: 'email', label: '邮箱地址', required: true },
      { name: 'phone', type: 'phone', label: '联系电话', required: false }
    ],
    submitText: '提交申请',
    layout: 'card'
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

export default function CreatePage() {
  const { token } = useAuth()
  const router = useRouter()
  const [pageName, setPageName] = useState('未命名落地页')
  const [slug, setSlug] = useState('new-landing-page')
  const [enableAgeVerification, setEnableAgeVerification] = useState(false)
  const [components, setComponents] = useState<ComponentInstance[]>([
    { id: '1', type: 'hero', data: { ...COMPONENT_TEMPLATES.hero }, isOpen: true },
    { id: '2', type: 'features', data: { ...COMPONENT_TEMPLATES.features }, isOpen: false },
    { id: '3', type: 'form', data: { ...COMPONENT_TEMPLATES.form }, isOpen: false }
  ])

  const [saving, setSaving] = useState(false)
  const [assetPickerConfig, setAssetPickerConfig] = useState<{ id: string; field: string; value: string } | null>(null)

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

  const savePage = async () => {
    if (!token) return
    try {
      setSaving(true)
      const payload = {
        name: pageName,
        slug: slug,
        enable_age_verification: enableAgeVerification,
        config: { components },
        is_published: false
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await axios.post(`${API_BASE_URL}/pages/`, payload, config)
      
      alert('页面创建成功！')
      router.push('/admin/pages')
    } catch (err: any) {
      console.error('Failed to save page:', err)
      alert(err.response?.data?.detail || '保存失败，请检查后端服务')
    } finally {
      setSaving(false)
    }
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
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                className="bg-transparent border-none focus:ring-0 p-0 ml-0.5 text-blue-500 font-medium hover:underline cursor-pointer w-32"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <Eye className="w-4 h-4 mr-2" />
            预览
          </button>
          <button 
            onClick={savePage}
            disabled={saving}
            className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            发布页面
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-73px)]">
        {/* 左侧组件列表 */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-8 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">页面设置</h3>
            <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldAlert className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-sm font-bold text-gray-700">18禁年龄确认</span>
                </div>
                <button 
                  onClick={() => setEnableAgeVerification(!enableAgeVerification)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enableAgeVerification ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableAgeVerification ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                开启后，用户访问该落地页时将首先看到年龄确认弹窗。
              </p>
            </div>
          </div>

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
              <button 
                onClick={() => addComponent('testimonials')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">客户评价</span>
              </button>
              <button 
                onClick={() => addComponent('cta')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-blue-50 hover:border-blue-200 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-600 mt-2 group-hover:text-blue-600">行动呼吁</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">页面设置</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center text-gray-700 font-bold text-sm mb-3">
                  <Settings className="w-4 h-4 mr-2" />
                  SEO 与 追踪
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">页面标题 (Title)</label>
                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors" placeholder="浏览器标签页标题" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">追踪脚本 (GA/FB)</label>
                    <textarea className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors h-20" placeholder="粘贴您的 Pixel 或 GA 代码"></textarea>
                  </div>
                </div>
              </div>
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
                            <Settings className="w-3 h-3 mr-1" /> 布局样式选择
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { id: 'split', name: '标准分栏' },
                              { id: 'centered', name: '居中对齐' },
                              { id: 'minimal', name: '极简无图' },
                              { id: 'dark', name: '深色商务' }
                            ].map(layout => (
                              <button
                                key={layout.id}
                                onClick={() => updateComponentData(comp.id, 'layout', layout.id)}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${comp.data.layout === layout.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                              >
                                {layout.name}
                              </button>
                            ))}
                          </div>
                        </div>
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
                            <ImageIcon className="w-3 h-3 mr-1" /> 背景图片 URL
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
                              <ImageIcon className="w-4 h-4 mr-2" />
                              素材库
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {comp.type === 'features' && (
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Settings className="w-3 h-3 mr-1" /> 布局样式选择
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { id: 'grid', name: '网格卡片' },
                              { id: 'alternating', name: '交替分栏' },
                              { id: 'list', name: '简洁列表' }
                            ].map(layout => (
                              <button
                                key={layout.id}
                                onClick={() => updateComponentData(comp.id, 'layout', layout.id)}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${comp.data.layout === layout.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                              >
                                {layout.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {(comp.data.features || []).map((feature: any, i: number) => (
                          <div key={i} className="p-6 bg-gray-50 rounded-2xl relative group/item">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 flex items-center space-x-4">
                                <div 
                                  onClick={() => setAssetPickerConfig({ id: comp.id, field: `features.${i}.imageUrl`, value: feature.imageUrl || '' })}
                                  className="w-16 h-16 bg-white rounded-xl flex items-center justify-center cursor-pointer border border-gray-100 overflow-hidden"
                                >
                                  {feature.imageUrl ? <img src={feature.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                                </div>
                                <div className="flex-1">
                                  <input 
                                    type="text" 
                                    value={feature.title}
                                    onChange={(e) => {
                                      const newFeatures = [...comp.data.features]
                                      newFeatures[i].title = e.target.value
                                      updateComponentData(comp.id, 'features', newFeatures)
                                    }}
                                    className="w-full bg-white font-bold text-gray-900 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                                    placeholder="功能标题"
                                  />
                                </div>
                              </div>
                              <div className="col-span-2">
                                <textarea 
                                  value={feature.description}
                                  onChange={(e) => {
                                    const newFeatures = [...comp.data.features]
                                    newFeatures[i].description = e.target.value
                                    updateComponentData(comp.id, 'features', newFeatures)
                                  }}
                                  className="w-full bg-white text-sm text-gray-500 border border-gray-100 rounded-lg px-3 py-2 h-20 focus:border-blue-500 outline-none transition-all"
                                  placeholder="功能详细描述..."
                                ></textarea>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const newFeatures = comp.data.features.filter((_: any, idx: number) => idx !== i)
                                updateComponentData(comp.id, 'features', newFeatures)
                              }}
                              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newFeatures = [...(comp.data.features || []), { icon: 'Zap', title: '新功能', description: '描述信息' }]
                            updateComponentData(comp.id, 'features', newFeatures)
                          }}
                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-xs hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 mr-2" /> 添加新功能项
                        </button>
                      </div>
                    )}

                    {comp.type === 'form' && (
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Settings className="w-3 h-3 mr-1" /> 布局样式选择
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { id: 'card', name: '标准卡片' },
                              { id: 'inline', name: '横向简约' },
                              { id: 'floating', name: '浮动悬浮' }
                            ].map(layout => (
                              <button
                                key={layout.id}
                                onClick={() => updateComponentData(comp.id, 'layout', layout.id)}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${comp.data.layout === layout.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                              >
                                {layout.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-500 block">表单字段配置</label>
                          {(comp.data.fields || []).map((field: any, i: number) => (
                            <div key={i} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl">
                              <input 
                                type="text" 
                                value={field.label}
                                onChange={(e) => {
                                  const newFields = [...comp.data.fields]
                                  newFields[i].label = e.target.value
                                  updateComponentData(comp.id, 'fields', newFields)
                                }}
                                className="flex-1 bg-white text-xs font-bold border border-gray-100 rounded-lg px-3 py-1.5 outline-none"
                              />
                              <select 
                                value={field.type}
                                onChange={(e) => {
                                  const newFields = [...comp.data.fields]
                                  newFields[i].type = e.target.value
                                  updateComponentData(comp.id, 'fields', newFields)
                                }}
                                className="bg-white text-[10px] font-bold border border-gray-100 rounded-lg px-2 py-1.5 outline-none"
                              >
                                <option value="text">文本</option>
                                <option value="email">邮箱</option>
                                <option value="phone">电话</option>
                              </select>
                              <button 
                                onClick={() => {
                                  const newFields = comp.data.fields.filter((_: any, idx: number) => idx !== i)
                                  updateComponentData(comp.id, 'fields', newFields)
                                }}
                                className="text-gray-300 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newFields = [...(comp.data.fields || []), { name: `field_${Date.now()}`, type: 'text', label: '新字段', required: true }]
                              updateComponentData(comp.id, 'fields', newFields)
                            }}
                            className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-[10px] hover:border-blue-300 hover:text-blue-500 transition-all"
                          >
                            + 添加字段
                          </button>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">提交按钮文字</label>
                          <input 
                            type="text" 
                            value={comp.data.submitText}
                            onChange={(e) => updateComponentData(comp.id, 'submitText', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {comp.type === 'about' && (
                      <div className="grid grid-cols-2 gap-6">
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
                            <Type className="w-3 h-3 mr-1" /> 内容详情
                          </label>
                          <textarea 
                            value={comp.data.content || ''}
                            onChange={(e) => updateComponentData(comp.id, 'content', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium h-48"
                          ></textarea>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-gray-500 mb-2 block">配图</label>
                          <div 
                            onClick={() => setAssetPickerConfig({ id: comp.id, field: 'imageUrl', value: comp.data.imageUrl || '' })}
                            className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all overflow-hidden"
                          >
                            {comp.data.imageUrl ? (
                              <img src={comp.data.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                <span className="text-xs text-gray-400 font-medium">点击选择图片</span>
                              </>
                            )}
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

                    {comp.type === 'testimonials' && (
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Settings className="w-3 h-3 mr-1" /> 布局样式选择
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { id: 'grid', name: '网格卡片' },
                              { id: 'carousel', name: '横向滚动' }
                            ].map(layout => (
                              <button
                                key={layout.id}
                                onClick={() => updateComponentData(comp.id, 'layout', layout.id)}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${comp.data.layout === layout.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                              >
                                {layout.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {(comp.data.testimonials || []).map((testimonial: any, i: number) => (
                          <div key={i} className="p-6 bg-gray-50 rounded-2xl relative group/item space-y-4">
                            <div className="flex items-center space-x-4">
                              <div 
                                onClick={() => setAssetPickerConfig({ id: comp.id, field: `testimonials.${i}.avatar`, value: testimonial.avatar || '' })}
                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-gray-200 overflow-hidden"
                              >
                                {testimonial.avatar ? <img src={testimonial.avatar} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <input 
                                  type="text" 
                                  value={testimonial.name}
                                  onChange={(e) => {
                                    const newTestimonials = [...comp.data.testimonials]
                                    newTestimonials[i].name = e.target.value
                                    updateComponentData(comp.id, 'testimonials', newTestimonials)
                                  }}
                                  className="bg-white font-bold text-gray-900 border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none transition-all"
                                  placeholder="姓名"
                                />
                                <input 
                                  type="text" 
                                  value={testimonial.role}
                                  onChange={(e) => {
                                    const newTestimonials = [...comp.data.testimonials]
                                    newTestimonials[i].role = e.target.value
                                    updateComponentData(comp.id, 'testimonials', newTestimonials)
                                  }}
                                  className="bg-white text-gray-500 border border-gray-100 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 outline-none transition-all"
                                  placeholder="职位"
                                />
                              </div>
                            </div>
                            <textarea 
                              value={testimonial.content}
                              onChange={(e) => {
                                const newTestimonials = [...comp.data.testimonials]
                                newTestimonials[i].content = e.target.value
                                updateComponentData(comp.id, 'testimonials', newTestimonials)
                              }}
                              className="w-full bg-white text-xs text-gray-600 border border-gray-100 rounded-lg px-3 py-2 h-20 focus:border-blue-500 outline-none transition-all"
                              placeholder="评价内容..."
                            ></textarea>
                            <button 
                              onClick={() => {
                                const newTestimonials = comp.data.testimonials.filter((_: any, idx: number) => idx !== i)
                                updateComponentData(comp.id, 'testimonials', newTestimonials)
                              }}
                              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newTestimonials = [...(comp.data.testimonials || []), { name: '新客户', role: 'CEO', avatar: '', content: '新评价内容' }]
                            updateComponentData(comp.id, 'testimonials', newTestimonials)
                          }}
                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-xs hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 mr-2" /> 添加新评价
                        </button>
                      </div>
                    )}

                    {comp.type === 'cta' && (
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center">
                            <Settings className="w-3 h-3 mr-1" /> 布局样式选择
                          </label>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { id: 'standard', name: '商务蓝' },
                              { id: 'simple', name: '白净简约' },
                              { id: 'card', name: '深色卡片' }
                            ].map(layout => (
                              <button
                                key={layout.id}
                                onClick={() => updateComponentData(comp.id, 'layout', layout.id)}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${comp.data.layout === layout.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'}`}
                              >
                                {layout.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">CTA 标题</label>
                          <input 
                            type="text" 
                            value={comp.data.title || ''}
                            onChange={(e) => updateComponentData(comp.id, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block">副标题</label>
                          <input 
                            type="text" 
                            value={comp.data.subtitle || ''}
                            onChange={(e) => updateComponentData(comp.id, 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">按钮文字</label>
                            <input 
                              type="text" 
                              value={comp.data.buttonText || ''}
                              onChange={(e) => updateComponentData(comp.id, 'buttonText', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">按钮链接</label>
                            <input 
                              type="text" 
                              value={comp.data.buttonLink || ''}
                              onChange={(e) => updateComponentData(comp.id, 'buttonLink', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                            />
                          </div>
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
            } else if (assetPickerConfig.field.startsWith('testimonials.')) {
              const index = parseInt(assetPickerConfig.field.split('.')[1])
              const comp = components.find(c => c.id === assetPickerConfig.id)
              if (comp && comp.data.testimonials) {
                const newTestimonials = [...comp.data.testimonials]
                newTestimonials[index].avatar = url
                updateComponentData(assetPickerConfig.id, 'testimonials', newTestimonials)
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
