import React from 'react';
import { FeatureProps } from '@/types/components';
import { getFullUrl } from '@/config';

const Features: React.FC<FeatureProps> = ({ features, isMobile }) => {
  return (
    <section className={`py-16 ${isMobile ? 'px-4' : 'px-8'}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {features.map((feature, index) => (
            <div key={index} className="text-center p-8 bg-white rounded-3xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
              <div className="mb-6 relative h-20 w-20 mx-auto">
                <div className="absolute inset-0 bg-blue-50 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative h-full w-full bg-white rounded-2xl border border-blue-100 flex items-center justify-center overflow-hidden">
                  {feature.imageUrl ? (
                    <img 
                      src={getFullUrl(feature.imageUrl)} 
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Fallback to icon if no image provided - assume it might be a URL for now to keep consistency */
                    <img 
                      src={feature.icon} 
                      alt={feature.title}
                      className="w-12 h-12"
                    />
                  )}
                </div>
              </div>
              <h3 className={`font-bold text-gray-900 mb-3 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;