import React from 'react';
import { TestimonialProps } from '@/types/components';

const Testimonials: React.FC<TestimonialProps> = ({ testimonials, isMobile }) => {
  return (
    <section className={`py-16 bg-gray-50 ${isMobile ? 'px-4' : 'px-8'}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &quot;{testimonial.content}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;