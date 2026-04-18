import React from 'react';
import { FeatureProps } from '@/types/components';
import { getFullUrl } from '@/config';
import { Zap, Layout, BarChart3 } from 'lucide-react';

const Features: React.FC<FeatureProps> = ({ features, isMobile, layout = 'grid' }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-8 h-8" />;
      case 'Layout': return <Layout className="w-8 h-8" />;
      case 'BarChart3': return <BarChart3 className="w-8 h-8" />;
      default: return null;
    }
  };

  if (layout === 'alternating') {
    return (
      <section className={`py-32 bg-white ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">强大功能展示</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="space-y-32">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col ${!isMobile && index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
                <div className="w-full md:w-1/2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-2xl"></div>
                    {feature.imageUrl ? (
                      <img src={getFullUrl(feature.imageUrl)} alt={feature.title} className="relative z-10 rounded-[2.5rem] shadow-2xl w-full border border-slate-100" />
                    ) : (
                      <div className="relative z-10 w-full aspect-video bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100">
                        <div className="p-8 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-600/30 scale-150">
                          {getIcon(feature.icon)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-blue-600 font-black text-6xl opacity-20 mb-4 block italic">0{index + 1}</span>
                  <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">{feature.title}</h3>
                  <p className="text-xl text-slate-500 leading-relaxed font-medium mb-8">{feature.description}</p>
                  <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                    深入了解
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'list') {
    return (
      <section className={`py-32 bg-slate-50 ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">产品优势</h2>
            <p className="text-xl text-slate-500 font-medium">为什么选择我们的解决方案？</p>
          </div>
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {getIcon(feature.icon)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-32 bg-slate-50/50 ${isMobile ? 'px-4' : 'px-8'} relative`}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="text-blue-600 font-bold tracking-[0.2em] uppercase text-sm mb-4">Core Capabilities</div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">核心业务能力</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">专业的企业级解决方案，助您在竞争激烈的市场中脱颖而出</p>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'grid-cols-2 lg:grid-cols-3 gap-12'}`}>
          {features.map((feature, index) => (
            <div key={index} className="relative group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black text-slate-900 italic">0{index + 1}</span>
              </div>
              <div className="mb-10 relative h-16 w-16">
                <div className="absolute -inset-2 bg-blue-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative h-full w-full bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                  {feature.imageUrl ? (
                    <img 
                      src={getFullUrl(feature.imageUrl)} 
                      alt={feature.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-white scale-125">
                      {getIcon(feature.icon)}
                    </div>
                  )}
                </div>
              </div>
              <h3 className={`font-black text-slate-900 mb-4 tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-lg font-medium">
                {feature.description}
              </p>
              <div className="mt-8 flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform cursor-pointer">
                <span>探索更多</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;