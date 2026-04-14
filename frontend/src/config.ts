/**
 * 前端全局配置文件
 * 优先从环境变量读取，方便在部署时通过 .env 文件统一修改
 */

// 后端基础 URL (例如: http://localhost:8000)
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API 接口基础路径 (例如: http://localhost:8000/api/v1)
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

/**
 * 处理素材的完整访问路径
 * @param url 相对路径或绝对路径
 * @returns 完整的访问 URL
 */
export const getFullUrl = (url: string) => {
  if (!url) return '';
  // 如果已经是完整的 http 路径，则直接返回
  if (url.startsWith('http')) return url;
  
  // 处理路径开头的斜杠
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  return `${BACKEND_URL}/${cleanUrl}`;
};
