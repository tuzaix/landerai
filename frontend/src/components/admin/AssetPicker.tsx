'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Search, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Loader2,
  CheckCircle2
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL, getFullUrl } from '@/config'

interface Asset {
  id: number
  name: string
  type: string
  original_url: string
}

interface AssetPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
  currentValue?: string
}

export default function AssetPicker({ onSelect, onClose, currentValue }: AssetPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUrl, setSelectedUrl] = useState(currentValue || '')

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/assets/?limit=100`)
        setAssets(response.data)
      } catch (err) {
        console.error('Failed to fetch assets:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [])

  const filteredAssets = assets.filter(asset => 
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">选择素材</h3>
            <p className="text-sm text-gray-500 mt-1">从素材库中选择图片或视频</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索素材名称..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500 font-medium">正在加载素材库...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <ImageIcon className="w-8 h-8" />
              </div>
              <p className="text-gray-900 font-bold text-lg">未找到素材</p>
              <p className="text-gray-500 mt-1">尝试搜索其他关键词或先去素材库上传</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => {
                const fullUrl = getFullUrl(asset.original_url)
                const isSelected = selectedUrl === fullUrl
                
                return (
                  <div 
                    key={asset.id} 
                    onClick={() => setSelectedUrl(fullUrl)}
                    className={`group relative bg-gray-50 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                      {asset.type.startsWith('image/') ? (
                        <img 
                          src={fullUrl} 
                          alt={asset.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                          {asset.type.startsWith('video/') ? <Video className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-xs font-bold text-gray-900 truncate" title={asset.name}>{asset.name}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg shadow-blue-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            onClick={() => {
              if (selectedUrl) {
                onSelect(selectedUrl)
                onClose()
              }
            }}
            disabled={!selectedUrl}
            className="px-8 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确定选择
          </button>
        </div>
      </div>
    </div>
  )
}
