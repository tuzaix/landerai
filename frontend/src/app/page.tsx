'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/hero/Hero';
import Features from '@/components/features/Features';
import Testimonials from '@/components/testimonials/Testimonials';
import Form from '@/components/forms/Form';
import CTA from '@/components/cta/CTA';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const { token, loading } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const buttonLink = !loading && token ? "/admin/dashboard" : "/login";

  const heroData = {
    title: "打造高转化率的智能落地页",
    subtitle: "AI驱动的智能落地页生成系统，帮助您快速创建专业的营销页面，提升转化率",
    buttonText: "免费使用",
    buttonLink: buttonLink,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    isMobile
  };

  const featuresData = {
    features: [
      {
        icon: "https://via.placeholder.com/64x64",
        title: "AI智能生成",
        description: "基于AI技术，自动生成专业的营销文案和设计"
      },
      {
        icon: "https://via.placeholder.com/64x64",
        title: "响应式设计",
        description: "完美适配移动端和桌面端，提供最佳用户体验"
      },
      {
        icon: "https://via.placeholder.com/64x64",
        title: "数据分析",
        description: "实时跟踪用户行为，提供详细的转化分析报告"
      }
    ],
    isMobile
  };

  const testimonialsData = {
    testimonials: [
      {
        name: "张经理",
        role: "市场总监",
        avatar: "https://via.placeholder.com/48x48",
        content: "使用这个系统后，我们的转化率提升了30%，非常满意！"
      },
      {
        name: "李总监",
        role: "营销总监",
        avatar: "https://via.placeholder.com/48x48",
        content: "操作简单，功能强大，帮助我们节省了大量时间和成本。"
      },
      {
        name: "王经理",
        role: "产品经理",
        avatar: "https://via.placeholder.com/48x48",
        content: "AI生成的内容质量很高，大大提高了我们的工作效率。"
      }
    ],
    isMobile
  };

  const formData = {
    pageId: 1,
    fields: [
      {
        name: "name",
        type: "text" as const,
        label: "姓名",
        required: true
      },
      {
        name: "email",
        type: "email" as const,
        label: "邮箱",
        required: true
      },
      {
        name: "phone",
        type: "phone" as const,
        label: "电话",
        required: false
      }
    ],
    submitText: "获取演示"
  };

  const ctaData = {
    title: "准备好提升您的转化率了吗？",
    subtitle: "立即开始使用我们的AI智能落地页系统",
    buttonText: "免费使用",
    buttonLink: buttonLink,
    isMobile
  };

  return (
    <main>
      <Hero {...heroData} />
      <section id="features">
        <Features {...featuresData} />
      </section>
      <Testimonials {...testimonialsData} />
      <section id="form">
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">联系我们</h2>
            <p className="text-xl text-gray-600">填写表单，我们将为您提供专业的解决方案</p>
          </div>
          <Form {...formData} />
        </div>
      </section>
      <CTA {...ctaData} />
    </main>
  );
}