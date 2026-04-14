import React from 'react';
import { TestimonialProps } from '@/types/components';

const Testimonials: React.FC<TestimonialProps> = ({ testimonials, isMobile }) => {
  return (
    <section className={`py-32 bg-white ${isMobile ? 'px-4' : 'px-8'} relative`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="text-blue-600 font-bold tracking-[0.2em] uppercase text-sm mb-4">Client Success</div>
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight text-left">全球企业信赖之选</h2>
            <p className="text-xl text-slate-600 font-medium text-left">超过 500+ 企业正在使用 LanderAI 提升全球化营销效率</p>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900">
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
            <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center cursor-pointer bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div className="ml-5">
                  <h4 className="font-black text-slate-900 text-xl">{testimonial.name}</h4>
                  <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1">{testimonial.role}</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute -top-4 -left-2 w-10 h-10 text-blue-600/10" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8H6c0 4.418 3.582 8 8 8V28C7.373 28 2 22.627 2 16V8h8zm14 0v8h-4c0 4.418 3.582 8 8 8V28c-6.627 0-12-5.373-12-12V8h12z"></path></svg>
                <p className="text-slate-600 leading-relaxed text-lg font-medium relative z-10 italic">
                  &quot;{testimonial.content}&quot;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;