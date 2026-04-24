import { useState } from 'react'
import { resourceService } from '../../services/api'
import toast from 'react-hot-toast'

export default function ImageUploadManager({ resourceId, onUpdate, onDone }) {

  const [images, setImages] = useState([]) // preview files
  const [uploading, setUploading] = useState(false)

  // ✅ Select files (NO upload here)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per resource')
      return
    }

    const tooLarge = files.some(f => f.size > 5 * 1024 * 1024)
    if (tooLarge) {
      toast.error('Each image must be less than 5MB')
      return
    }

    // convert to preview URLs
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))

    setImages(prev => [...prev, ...newPreviews])

    e.target.value = ''
  }

  // ❌ removed delete feature (as requested)

  // ✅ FINAL UPLOAD BUTTON
  const handleSubmit = async () => {
    if (images.length === 0) {
      toast.error('Please select at least one image')
      return
    }

    setUploading(true)

    try {
      const files = images.map(img => img.file)

      await resourceService.uploadImages(resourceId, files)

      toast.success('Images uploaded successfully')

      onUpdate?.()
      onDone?.()

      // cleanup previews
      images.forEach(img => URL.revokeObjectURL(img.url))
      setImages([])

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Resource Images
        </h3>
        <span className="text-xs text-gray-400">
          {images.length}/5 images
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

        {/* PREVIEWS */}
        {images.map((img, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 border"
          >
            <img
              src={img.url}
              className="w-full h-full object-cover"
              alt={`preview-${i}`}
            />
          </div>
        ))}

        {/* UPLOAD BOX */}
        {images.length < 5 && (
          <label className={`
            aspect-square rounded-lg border-2 border-dashed border-gray-300 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-blue-400 hover:bg-blue-50 transition-all
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-medium text-gray-500 mt-1">
              Add
            </span>

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

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="btn-primary w-full mt-4"
      >
        {uploading ? 'Uploading...' : 'Upload Images'}
      </button>

    </div>
  )
}