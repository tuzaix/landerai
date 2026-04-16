'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Globe } from 'lucide-react'

export default function AgeRestrictedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">访问受限</h1>
        
        <div className="space-y-4 text-slate-600 font-medium leading-relaxed mb-12">
          <p className="text-lg">
            抱歉，您访问的内容仅限 <span className="text-orange-600 font-black">18 岁及以上</span> 的成年用户查看。
          </p>
          <p>
            由于相关法律法规和平台内容分级政策，我们必须确保所有访问者均符合年龄要求。
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col items-center">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            <span>Compliance & Content Safety</span>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm font-medium">
        &copy; 2024 Intelligent Overseas Marketing System. All rights reserved.
      </p>
    </div>
  )
}
