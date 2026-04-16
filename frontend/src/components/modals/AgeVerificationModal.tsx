'use client'

import React, { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

interface AgeVerificationModalProps {
  onVerify: (verified: boolean) => void
  pageId: number
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify, pageId }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 强制每次进入页面都显示弹窗，不从 localStorage 检查状态
    setIsVisible(true)
    // 禁止滚动
    document.body.style.overflow = 'hidden'
    
    return () => {
      // 组件卸载时恢复滚动（如果用户没点确认就离开了）
      document.body.style.overflow = 'auto'
    }
  }, [pageId])

  const handleVerify = (success: boolean) => {
    if (success) {
      // 仅在当前会话中隐藏，不存储在 localStorage
      setIsVisible(false)
      document.body.style.overflow = 'auto'
      onVerify(true)
    } else {
      // 如果拒绝，跳转到年龄限制说明页
      window.location.href = '/age-restricted'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">内容分级确认</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          您访问的页面包含可能不适合 18 岁以下未成年人查看的内容。请确认您已年满 18 岁。
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleVerify(false)}
            className="flex items-center justify-center px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
          >
            <XCircle className="w-5 h-5 mr-2" />
            我未满18岁
          </button>
          <button 
            onClick={() => handleVerify(true)}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            我已满18岁
          </button>
        </div>
        
        <p className="mt-8 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Age Verification Required &bull; Compliance Check
        </p>
      </div>
    </div>
  )
}

export default AgeVerificationModal
