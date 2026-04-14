import React from 'react';
import Link from 'next/link';
import { HeroProps } from '@/types/components';
import { getFullUrl } from '@/config';

const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  buttonText, 
  buttonLink, 
  imageUrl, 
  isMobile 
}) => {
  return (
    <section className={`
      relative overflow-hidden bg-white
      ${isMobile ? 'py-16 px-4' : 'py-32 px-8'}
    `}>
      {/* 商务装饰背景 */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4 z-0"></div>
      <div className="absolute top-10 left-10 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl"></div>
      
      <div className={`max-w-7xl mx-auto relative z-10 flex ${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
        <div className={`${isMobile ? 'text-center mb-12' : 'w-1/2 pr-12'}`}>
          <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 border border-blue-100 rounded-full">
            <span className="text-blue-700 text-sm font-bold tracking-wider uppercase">Enterprise Ready</span>
          </div>
          <h1 className={`font-black text-slate-900 mb-6 leading-[1.1] tracking-tight ${isMobile ? 'text-4xl' : 'text-7xl'}`}>
            {title}
          </h1>
          <p className={`text-slate-600 mb-10 leading-relaxed font-medium ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link 
              href={buttonLink}
              className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-0.5"
            >
              {buttonText}
            </Link>
          </div>
        </div>
        <div className={`${isMobile ? 'w-full' : 'w-1/2'} relative`}>
          <div className="absolute -inset-4 bg-blue-600/5 rounded-[2.5rem] blur-2xl z-0"></div>
          <img 
            src={getFullUrl(imageUrl)} 
            alt="Hero" 
            className={`relative z-10 rounded-[2rem] shadow-2xl w-full border border-white ${isMobile ? 'h-auto' : 'h-auto scale-105'}`}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;