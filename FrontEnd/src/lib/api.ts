// API base URL - Proxy kullanıyoruz, direkt /api ile başla
export const API_BASE = '/api'

console.log('🔧 API_BASE:', API_BASE)
console.log('🌍 Environment:', import.meta.env.MODE)
console.log('📍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)

type FileOut = {
  id: number
  filename: string
  content_type?: string | null
  size?: number | null
  is_directory: boolean
  parent_id?: number | null
  created_at: string
}

export async function listFiles(parentId?: number): Promise<FileOut[]> {
  try {
    const params = new URLSearchParams()
    if (parentId !== undefined) {
      params.set('parent_id', parentId.toString())
    }
    
    const url = `${API_BASE}/files${params.toString() ? '?' + params.toString() : ''}`
    console.log('🚀 Fetching URL:', url)
    
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    const data: FileOut[] = await res.json()
    return data
  } catch (error) {
    console.error('❌ List files error:', error)
    throw error
  }
}

export async function uploadFile(file: File, parentId?: number): Promise<FileOut> {
  try {
    const fd = new FormData()
    fd.append('file', file)
    if (parentId !== undefined) {
      fd.append('parent_id', parentId.toString())
    }

    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: fd,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Yükleme başarısız (${res.status}): ${errorText}`)
    }

    const data: FileOut = await res.json()
    return data
  } catch (error) {
    console.error('Upload file error:', error)
    throw error
  }
}

export async function createFolder(name: string, parentId?: number): Promise<FileOut> {
  try {
    const res = await fetch(`${API_BASE}/files/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        parent_id: parentId || null,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Klasör oluşturulamadı (${res.status}): ${errorText}`)
    }

    const data: FileOut = await res.json()
    return data
  } catch (error) {
    console.error('Create folder error:', error)
    throw error
  }
}

export function downloadUrl(id: number | string): string {
  return `${API_BASE}/files/download/${id}`
}

export async function deleteFile(id: number | string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/files/${id}`, { 
      method: 'DELETE' 
    })
    
    if (!res.ok) {
      throw new Error(`Silme başarısız (${res.status}): ${res.statusText}`)
    }
  } catch (error) {
    console.error('Delete file error:', error)
    throw error
  }
}
