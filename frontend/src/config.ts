
export const API_BASE_URL = 'http://localhost:8000/api/v1'
export const BACKEND_URL = 'http://localhost:8000'

export const getFullUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url
  return `${BACKEND_URL}/${cleanUrl}`
}
