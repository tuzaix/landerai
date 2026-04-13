import React from 'react'
import { ShieldAlert } from 'lucide-react'

interface DisclaimerProps {
  title: string
  content: string
}

export default function Disclaimer({ title, content }: DisclaimerProps) {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-12 lg:p-16 rounded-[2.5rem] shadow-xl shadow-gray-200/30 border border-gray-100">
        <div className="flex items-center space-x-4 mb-10">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>
        
        <div 
          className="prose prose-blue max-w-none text-gray-500 text-sm leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: content }}
        >
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Official Disclaimer</span>
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </section>
  )
}
