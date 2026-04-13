import React from 'react';
import { CtaProps } from '@/types/components';

const CTA: React.FC<CtaProps> = ({ title, subtitle, buttonText, buttonLink, isMobile }) => {
  return (
    <section className={`py-16 bg-blue-600 ${isMobile ? 'px-4' : 'px-8'}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`font-bold text-white mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
          {title}
        </h2>
        <p className={`text-blue-100 mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}>
          {subtitle}
        </p>
        <a 
          href={buttonLink}
          className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
};

export default CTA;