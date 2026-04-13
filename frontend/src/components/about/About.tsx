import React from 'react'
import { getFullUrl } from '@/config'

interface AboutProps {
  title: string
  content: string
  imageUrl?: string
}

export default function About({ title, content, imageUrl }: AboutProps) {
  return (
    <section className="py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {imageUrl && (
            <div className="flex-1 w-full relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/50">
                <img 
                  src={getFullUrl(imageUrl)} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-blue-600 rounded-[2rem] -z-10 animate-pulse"></div>
            </div>
          )}
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {title}
              </h2>
              <div className="w-20 h-2 bg-blue-600 mt-6 rounded-full"></div>
            </div>
            <div 
              className="text-lg text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: content }}
            >
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
