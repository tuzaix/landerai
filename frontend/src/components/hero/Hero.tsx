import React from 'react';
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
      relative overflow-hidden
      ${isMobile ? 'py-12 px-4' : 'py-20 px-8'}
    `}>
      <div className={`max-w-7xl mx-auto flex ${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
        <div className={`${isMobile ? 'text-center mb-8' : 'w-1/2 pr-8'}`}>
          <h1 className={`font-bold text-gray-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            {title}
          </h1>
          <p className={`text-gray-600 mb-6 ${isMobile ? 'text-base' : 'text-xl'}`}>
            {subtitle}
          </p>
          <a 
            href={buttonLink}
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {buttonText}
          </a>
        </div>
        <div className={`${isMobile ? 'w-full' : 'w-1/2'}`}>
          <img 
            src={getFullUrl(imageUrl)} 
            alt="Hero" 
            className={`rounded-lg shadow-lg w-full ${isMobile ? 'h-auto' : 'h-auto'}`}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;