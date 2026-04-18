import React from 'react';
import Link from 'next/link';
import { CtaProps } from '@/types/components';

const CTA: React.FC<CtaProps> = ({ title, subtitle, buttonText, buttonLink, isMobile, layout = 'standard' }) => {
  if (layout === 'simple') {
    return (
      <section className={`py-24 bg-slate-50 ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 p-16 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{title}</h2>
            <p className="text-xl text-slate-500 font-medium">{subtitle}</p>
          </div>
          <Link 
            href={buttonLink}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1"
          >
            {buttonText}
          </Link>
        </div>
      </section>
    );
  }

  if (layout === 'card') {
    return (
      <section className={`py-32 ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className="max-w-5xl mx-auto relative overflow-hidden bg-slate-900 rounded-[4rem] p-20 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white mb-8 tracking-tight">{title}</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">{subtitle}</p>
            <Link 
              href={buttonLink}
              className="inline-block px-12 py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-white/10 hover:-translate-y-1"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 bg-blue-600 ${isMobile ? 'px-4' : 'px-8'} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className={`font-black text-white mb-6 leading-tight ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
          {title}
        </h2>
        <p className={`text-white opacity-90 mb-10 leading-relaxed font-semibold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
          {subtitle}
        </p>
        <Link 
          href={buttonLink}
          className="inline-block px-12 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl shadow-blue-900/10"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default CTA;