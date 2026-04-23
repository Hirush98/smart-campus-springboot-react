import { useState } from 'react'
import { resourceService } from '../../services/api'
import toast from 'react-hot-toast'

export default function ImageUploadManager({ resourceId, imageUrls, onUpdate }) {
  const images = imageUrls || []
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit check
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per resource')
      return
    }

    // Size check (5MB)
    const tooLarge = files.some(f => f.size > 5 * 1024 * 1024)
    if (tooLarge) {
      toast.error('Each image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      await resourceService.uploadImages(resourceId, files)
      toast.success('Images uploaded successfully')
      onUpdate()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      e.target.value = '' // reset input
    }
  }

  const handleDelete = async (url) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return
    setDeleting(url)
    try {
      await resourceService.deleteImage(resourceId, url)
      toast.success('Image deleted')
      onUpdate()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Resource Images</h3>
        <span className="text-xs text-gray-400">{images.length}/5 images</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {images.map((url, i) => (
          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border">
            <img 
              src={url} 
              alt={`Resource ${i}`} 
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDelete(url)}
              disabled={deleting === url}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {deleting === url && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        ))}

        {images.length < 5 && (
          <label className={`
            aspect-square rounded-lg border-2 border-dashed border-gray-300 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-blue-400 hover:bg-blue-50 transition-all
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            {uploading ? (
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-medium text-gray-500 mt-1">Upload</span>
              </>
            )}
            <input 
              type="file" 
              multiple 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}
