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
  isMobile,
  layout = 'split'
}) => {
  if (layout === 'centered') {
    return (
      <section className={`relative overflow-hidden bg-white ${isMobile ? 'py-16 px-4' : 'py-32 px-8'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-50/20 blur-3xl rounded-full opacity-50 -z-0"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 border border-blue-100 rounded-full">
            <span className="text-blue-700 text-sm font-bold tracking-wider uppercase">Advanced Solution</span>
          </div>
          <h1 className={`font-black text-slate-900 mb-8 leading-[1.1] tracking-tight ${isMobile ? 'text-4xl' : 'text-7xl'}`}>
            {title}
          </h1>
          <p className={`text-slate-600 mb-12 leading-relaxed font-medium max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {subtitle}
          </p>
          <Link 
            href={buttonLink}
            className="inline-block px-12 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 hover:-translate-y-1 text-lg mb-16"
          >
            {buttonText}
          </Link>
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-3xl z-0"></div>
            <img 
              src={getFullUrl(imageUrl)} 
              alt="Hero Centered" 
              className="relative z-10 rounded-[2.5rem] shadow-2xl w-full border border-white"
            />
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'dark') {
    return (
      <section className={`relative overflow-hidden bg-slate-900 ${isMobile ? 'py-16 px-4' : 'py-32 px-8'}`}>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 -skew-x-12 translate-x-1/4 z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center">
          <div className={`${isMobile ? 'text-center mb-12' : 'w-1/2 pr-12'}`}>
            <h1 className={`font-black text-white mb-6 leading-[1.1] tracking-tight ${isMobile ? 'text-4xl' : 'text-7xl'}`}>
              {title}
            </h1>
            <p className={`text-slate-400 mb-10 leading-relaxed font-medium ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              {subtitle}
            </p>
            <Link 
              href={buttonLink}
              className="inline-block px-10 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10 hover:-translate-y-0.5"
            >
              {buttonText}
            </Link>
          </div>
          <div className={`${isMobile ? 'w-full' : 'w-1/2'} relative`}>
            <img 
              src={getFullUrl(imageUrl)} 
              alt="Hero Dark" 
              className="relative z-10 rounded-[2rem] shadow-2xl w-full border border-slate-800"
            />
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'minimal') {
    return (
      <section className={`relative overflow-hidden bg-slate-50 ${isMobile ? 'py-24 px-4' : 'py-48 px-8'}`}>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h1 className={`font-black text-slate-900 mb-8 leading-[1.1] tracking-tight ${isMobile ? 'text-5xl' : 'text-8xl'}`}>
            {title}
          </h1>
          <p className={`text-slate-500 mb-12 leading-relaxed font-medium ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {subtitle}
          </p>
          <Link 
            href={buttonLink}
            className="inline-block px-12 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 hover:-translate-y-1 text-lg"
          >
            {buttonText}
          </Link>
        </div>
      </section>
    );
  }

  // Default 'split' layout
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