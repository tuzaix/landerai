'use client'

import React, { useState, useEffect } from 'react'
import { ShieldAlert, CheckCircle2, XCircle, Users, Cookie, User } from 'lucide-react'

interface AgeVerificationModalProps {
  onVerify: (verified: boolean) => void
  pageId: number
  enableAge?: boolean
  enableGender?: boolean
  enableCookies?: boolean
}

type Step = 'age' | 'gender' | 'cookies'

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ 
  onVerify, 
  pageId,
  enableAge = true,
  enableGender = false,
  enableCookies = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [lang, setLang] = useState<'zh' | 'en' | 'es'>('en')
  const [currentStep, setCurrentStep] = useState<Step>('age')

  const translations = {
    zh: {
      age: {
        title: '内容分级确认',
        description: '您访问的页面包含可能不适合 18 岁以下未成年人查看的内容。请确认您已年满 18 岁。',
        yes: '我已满18岁',
        no: '我未满18岁',
      },
      gender: {
        title: '性别选择',
        description: '请选择您的性别，以帮助我们提供更精准的内容体验。',
        male: '男',
        female: '女',
        secret: '保密',
      },
      cookies: {
        title: 'Cookie 设置',
        description: '我们使用 Cookie 来提升您的浏览体验。您可以选择接受或拒绝。',
        accept: '接受',
        decline: '拒绝',
      },
      footer: '安全验证 • 合规检查'
    },
    en: {
      age: {
        title: 'Age Verification',
        description: 'The page you are accessing contains content that may not be suitable for minors under 18. Please confirm you are 18 or older.',
        yes: 'I am 18 or older',
        no: 'I am under 18',
      },
      gender: {
        title: 'Gender Selection',
        description: 'Please select your gender to help us provide a more accurate experience.',
        male: 'Male',
        female: 'Female',
        secret: 'Secret',
      },
      cookies: {
        title: 'Cookie Settings',
        description: 'We use cookies to improve your browsing experience. You can choose to accept or decline.',
        accept: 'Accept',
        decline: 'Decline',
      },
      footer: 'Security Verification • Compliance Check'
    },
    es: {
      age: {
        title: 'Verificación de Edad',
        description: 'La página a la que accede contiene contenido que puede no ser apto para menores de 18 años. Por favor, confirme que tiene 18 años o más.',
        yes: 'Soy mayor de 18',
        no: 'Soy menor de 18',
      },
      gender: {
        title: 'Selección de Género',
        description: 'Por favor, seleccione su género para ayudarnos a brindar una experiencia más precisa.',
        male: 'Masculino',
        female: 'Femenino',
        secret: 'Secreto',
      },
      cookies: {
        title: 'Configuración de Cookies',
        description: 'Utilizamos cookies para mejorar su experiencia de navegación. Puede elegir aceptar o rechazar.',
        accept: 'Aceptar',
        decline: 'Rechazar',
      },
      footer: 'Verificación de Seguridad • Control de Cumplimiento'
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

    // 初始化第一个显示的步骤
    if (enableAge) {
      setCurrentStep('age')
    } else if (enableGender) {
      setCurrentStep('gender')
    } else if (enableCookies) {
      setCurrentStep('cookies')
    }

    setIsVisible(true)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [pageId, enableAge, enableGender, enableCookies])

  const t = translations[lang]

  const nextStep = () => {
    if (currentStep === 'age') {
      if (enableGender) {
        setCurrentStep('gender')
      } else if (enableCookies) {
        setCurrentStep('cookies')
      } else {
        finish()
      }
    } else if (currentStep === 'gender') {
      if (enableCookies) {
        setCurrentStep('cookies')
      } else {
        finish()
      }
    } else if (currentStep === 'cookies') {
      finish()
    }
  }

  const finish = () => {
    setIsVisible(false)
    document.body.style.overflow = 'auto'
    onVerify(true)
  }

  const handleAgeVerify = (success: boolean) => {
    if (success) {
      nextStep()
    } else {
      window.location.href = '/age-restricted'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl text-center animate-in zoom-in-95 duration-500">
        
        {/* Step: Age Verification */}
        {currentStep === 'age' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.age.title}</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">{t.age.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAgeVerify(false)}
                className="flex items-center justify-center px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                <XCircle className="w-5 h-5 mr-2" />
                {t.age.no}
              </button>
              <button 
                onClick={() => handleAgeVerify(true)}
                className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {t.age.yes}
              </button>
            </div>
          </div>
        )}

        {/* Step: Gender Selection */}
        {currentStep === 'gender' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.gender.title}</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">{t.gender.description}</p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={nextStep}
                className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <User className="w-5 h-5 mr-2" />
                {t.gender.male}
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center justify-center px-6 py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-pink-50 hover:text-pink-600 border-2 border-transparent hover:border-pink-100 transition-all active:scale-95"
              >
                <User className="w-5 h-5 mr-2" />
                {t.gender.female}
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center justify-center px-6 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
              >
                {t.gender.secret}
              </button>
            </div>
          </div>
        )}

        {/* Step: Cookies Consent */}
        {currentStep === 'cookies' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Cookie className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.cookies.title}</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">{t.cookies.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={finish}
                className="flex items-center justify-center px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                {t.cookies.decline}
              </button>
              <button 
                onClick={finish}
                className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {t.cookies.accept}
              </button>
            </div>
          </div>
        )}
        
        <p className="mt-8 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          {t.footer}
        </p>
      </div>
    </div>
  )
}

export default AgeVerificationModal
