'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  ExternalLink, 
  Upload,
  X,
  Loader2,
  AlertCircle,
  Filter
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL, getFullUrl } from '@/config'

interface Asset {
  id: number
  name: string
  type: string
  original_url: string
  tags?: string[]
  created_at: string
}

export default function AssetsManagementPage() {
  const { token, loading: authLoading } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchAssets = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const response = await axios.get(`${API_BASE_URL}/assets/?limit=100`, config)
      setAssets(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch assets:', err)
      setError(err.response?.data?.detail || '获取素材失败，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!authLoading && token) {
      fetchAssets()
    }
  }, [authLoading, token, fetchAssets])

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('确定要删除这个素材吗？')) return
    try {
      await axios.delete(`${API_BASE_URL}/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssets(assets.filter(a => a.id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !token) return
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await axios.post(`${API_BASE_URL}/assets/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      
      setAssets([response.data, ...assets])
      setShowUploadModal(false)
      setSelectedFile(null)
      alert('上传成功！')
    } catch (err) {
      console.error('Upload failed:', err)
      alert('上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  const filteredAssets = assets.filter(asset => 
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6" />
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />
    return <FileText className="w-6 h-6" />
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">素材库</h1>
          <p className="text-gray-500 mt-1">上传和管理您的广告图片、视频及其他资源</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        >
          <Upload className="w-5 h-5 mr-2" />
          上传素材
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索素材名称..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-gray-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all">
              <Filter className="w-5 h-5" />
            </button>
            <button 
              onClick={fetchAssets}
              className="p-3 bg-gray-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-bold">{error}</p>
            <button onClick={fetchAssets} className="mt-4 text-blue-600 font-bold hover:underline">点击重试</button>
          </div>
        )}

        {!loading && !error && filteredAssets.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">素材库空空如也</h3>
            <p className="text-gray-500 mt-1">上传一些图片或视频以便在落地页中使用</p>
          </div>
        )}

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-transparent hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                {asset.type.startsWith('image/') ? (
                  <img 
                    src={getFullUrl(asset.original_url)} 
                    alt={asset.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                    {getIcon(asset.type)}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-gray-900 truncate" title={asset.name}>{asset.name}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">{asset.type.split('/')[1]}</p>
              </div>
              
              <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDelete(asset.id)}
                  className="p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-lg shadow-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <a 
                  href={getFullUrl(asset.original_url)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 bg-white text-gray-400 hover:text-blue-500 rounded-lg shadow-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 上传弹窗 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">上传新素材</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  selectedFile ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                    selectedFile ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-gray-900">点击或拖拽文件到这里</p>
                      <p className="text-xs text-gray-500 mt-1">支持图片 (PNG, JPG, WEBP) 和视频 (MP4)</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 正在上传...</>
                  ) : (
                    '开始上传'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
