import React from 'react';
import Link from 'next/link';
import { CtaProps } from '@/types/components';

const CTA: React.FC<CtaProps> = ({ title, subtitle, buttonText, buttonLink, isMobile }) => {
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
          className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default CTA;