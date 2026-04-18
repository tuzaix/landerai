/**
 * 头部Hero组件
 * AI可直接根据该Interface生成组件代码
 */
export interface HeroProps {
  /** 主标题 */
  title: string;
  /** 副标题 */
  subtitle: string;
  /** 按钮文字 */
  buttonText: string;
  /** 按钮跳转链接 */
  buttonLink: string;
  /** 背景/主图URL */
  imageUrl: string;
  /** 是否是移动端 */
  isMobile: boolean;
  /** 布局样式 */
  layout?: 'split' | 'centered' | 'minimal' | 'dark';
}

/**
 * 卖点组件
 */
export interface FeatureProps {
  /** 卖点列表 */
  features: Array<{
    icon: string;
    title: string;
    description: string;
    imageUrl?: string;
  }>;
  isMobile: boolean;
  /** 布局样式 */
  layout?: 'grid' | 'alternating' | 'horizontal' | 'list';
}

/**
 * 评价组件
 */
export interface TestimonialProps {
  /** 评价列表 */
  testimonials: Array<{
    name: string;
    role: string;
    avatar: string;
    content: string;
  }>;
  isMobile: boolean;
  /** 布局样式 */
  layout?: 'grid' | 'carousel' | 'bubbles';
}

/**
 * 表单组件
 */
export interface FormProps {
  /** 页面ID，用于提交线索 */
  pageId: number;
  /** 表单字段 */
  fields: Array<{
    name: string;
    type: 'text' | 'email' | 'phone';
    label: string;
    required: boolean;
  }>;
  /** 提交按钮文字 */
  submitText: string;
  /** 提交回调 */
  onSubmit?: (data: any) => Promise<void>;
  /** 布局样式 */
  layout?: 'card' | 'inline' | 'floating';
}

/**
 * CTA组件
 */
export interface CtaProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isMobile: boolean;
  /** 布局样式 */
  layout?: 'standard' | 'simple' | 'card';
}