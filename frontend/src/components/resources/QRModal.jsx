import { useState, useEffect } from 'react'
import { resourceService } from '../../services/api'
import toast from 'react-hot-toast'

export default function QRModal({ show, onClose, resourceId, resourceName }) {
  const [qrUrl, setQrUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show && resourceId) {
      fetchQR()
    } else {
      setQrUrl(null)
    }
  }, [show, resourceId])

  const fetchQR = async () => {
    setLoading(true)
    try {
      const res = await resourceService.getQR(resourceId)
      const url = URL.createObjectURL(res.data)
      setQrUrl(url)
    } catch {
      toast.error('Failed to load QR code')
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrUrl) return
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `QR_${resourceName || resourceId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!show) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-900">Resource QR Code</h2>
            <p className="text-sm text-gray-500">{resourceName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">
            &times;
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 mb-6 border-2 border-dashed border-gray-200 min-h-[250px] flex items-center justify-center">
          {loading ? (
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          ) : qrUrl ? (
            <img src={qrUrl} alt="QR Code" className="w-full h-auto shadow-sm" />
          ) : (
            <p className="text-gray-400 text-sm">QR Code not available</p>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={downloadQR}
            disabled={!qrUrl}
            className="btn-primary flex-1 py-2 text-sm"
          >
            Download PNG
          </button>
          <button 
            onClick={onClose}
            className="btn-secondary flex-1 py-2 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
