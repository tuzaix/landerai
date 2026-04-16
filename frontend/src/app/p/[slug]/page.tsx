'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Hero from '@/components/hero/Hero'
import Features from '@/components/features/Features'
import Form from '@/components/forms/Form'
import Testimonials from '@/components/testimonials/Testimonials'
import CTA from '@/components/cta/CTA'
import About from '@/components/about/About'
import Disclaimer from '@/components/disclaimer/Disclaimer'
import AgeVerificationModal from '@/components/modals/AgeVerificationModal'
import { Loader2, Globe, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '@/config'

export default function PublicLandingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 处理响应式判断
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const fetchPage = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/pages/slug/${slug}`)
        setPageData(response.data)
        
        // 埋点统计：上报访问事件
        try {
          await axios.post(`${API_BASE_URL}/stats/event/${response.data.id}`, {
            event_type: 'visit',
            device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
            user_agent: navigator.userAgent
          })
        } catch (e) {
          console.error('Failed to track visit:', e)
        }
      } catch (err) {
        console.error('Failed to load page:', err)
        setError('您访问的页面不存在或已下线')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchPage()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">抱歉，页面无法访问</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <a href="/" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            返回首页
          </a>
        </div>
      </div>
    )
  }

  // 渲染组件映射
  const renderComponent = (comp: any) => {
    const props = { ...comp.data, isMobile, pageId: pageData.id }
    
    switch (comp.type) {
      case 'hero':
        return <Hero key={comp.id} {...props} />
      case 'features':
        return <Features key={comp.id} {...props} />
      case 'form':
        return (
          <div key={comp.id} className="py-20 px-4 bg-gray-50">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50">
              <Form 
                {...props} 
                onSubmit={async (data) => {
                  try {
                    await axios.post(`${API_BASE_URL}/leads/submit/${pageData.id}`, {
                      name: data.name,
                      email: data.email,
                      phone: data.phone,
                      message: data.message || '通过落地页表单提交'
                    })
                    
                    // 埋点统计：上报转化事件
                    await axios.post(`${API_BASE_URL}/stats/event/${pageData.id}`, {
                      event_type: 'conversion',
                      device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
                      user_agent: navigator.userAgent
                    })
                  } catch (e) {
                    console.error('Submission or tracking error:', e)
                    throw e // 让 Form 组件处理错误显示
                  }
                }}
              />
            </div>
          </div>
        )
      case 'testimonials':
        return <Testimonials key={comp.id} {...props} />
      case 'cta':
        return <CTA key={comp.id} {...props} />
      case 'about':
        return <About key={comp.id} {...props} />
      case 'disclaimer':
        return <Disclaimer key={comp.id} {...props} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 18禁年龄确认弹窗 */}
      {pageData.enable_age_verification && (
        <AgeVerificationModal 
          pageId={pageData.id} 
          onVerify={() => {}} 
        />
      )}
      
      {/* 动态渲染配置中的组件 */}
      {pageData.config?.components?.map((comp: any) => renderComponent(comp))}
      
      {/* 底部版权 */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Globe className="w-4 h-4" />
          <span className="font-bold tracking-tight">LanderAI Powered</span>
        </div>
        <p>&copy; 2024 Intelligent Overseas Marketing System. All rights reserved.</p>
      </footer>
    </div>
  )
}
