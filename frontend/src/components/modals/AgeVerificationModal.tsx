'use client'

import React, { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

interface AgeVerificationModalProps {
  onVerify: (verified: boolean) => void
  pageId: number
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify, pageId }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [lang, setLang] = useState<'zh' | 'en' | 'es'>('en')

  const translations = {
    zh: {
      title: '内容分级确认',
      description: '您访问的页面包含可能不适合 18 岁以下未成年人查看的内容。请确认您已年满 18 岁。',
      yes: '我已满18岁',
      no: '我未满18岁',
      footer: 'Age Verification Required • Compliance Check'
    },
    en: {
      title: 'Age Verification',
      description: 'The page you are accessing contains content that may not be suitable for minors under 18. Please confirm you are 18 or older.',
      yes: 'I am 18 or older',
      no: 'I am under 18',
      footer: 'Age Verification Required • Compliance Check'
    },
    es: {
      title: 'Verificación de Edad',
      description: 'La página a la que accede contiene contenido que puede no ser apto para menores de 18 años. Por favor, confirme que tiene 18 años o más.',
      yes: 'Soy mayor de 18',
      no: 'Soy menor de 18',
      footer: 'Se requiere verificación de edad • Control de cumplimiento'
    }
  }

  useEffect(() => {
    // 自动语言检测
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('zh')) {
      setLang('zh')
    } else if (browserLang.startsWith('es')) {
      setLang('es')
    } else {
      setLang('en')
    }

    // 强制每次进入页面都显示弹窗
    setIsVisible(true)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [pageId])

  const t = translations[lang]

  const handleVerify = (success: boolean) => {
    if (success) {
      setIsVisible(false)
      document.body.style.overflow = 'auto'
      onVerify(true)
    } else {
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
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.title}</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          {t.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleVerify(false)}
            className="flex items-center justify-center px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
          >
            <XCircle className="w-5 h-5 mr-2" />
            {t.no}
          </button>
          <button 
            onClick={() => handleVerify(true)}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {t.yes}
          </button>
        </div>
        
        <p className="mt-8 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          {t.footer}
        </p>
      </div>
    </div>
  )
}

export default AgeVerificationModal
