import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { resourceService } from '../services/api'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import ResourceModal from '../components/resources/ResourceModal'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const TYPE_LABELS = {
    LECTURE_HALL: 'Lecture Hall',
    LAB: 'Lab',
    MEETING_ROOM: 'Meeting Room',
    EQUIPMENT: 'Equipment',
}

export default function ResourceDetailsPage() {
    const { id } = useParams()
    const { isAdmin } = useAuth()
    const navigate = useNavigate()

    const [resource, setResource] = useState(null)
    const [loading, setLoading] = useState(true)
    const [qrUrl, setQrUrl] = useState(null)
    const [showViewer, setShowViewer] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showEditOptions, setShowEditOptions] = useState(false)
    const [editMode, setEditMode] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleUpdate = async (data) => {
        try {
            await resourceService.update(resource.id, data)
            toast.success('Resource updated')

            setEditMode(null)
            fetchResource()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed')
            throw err // IMPORTANT: keeps modal from silently finishing
        }
    }

    const handleDeleteResource = async () => {
        try {
            await resourceService.delete(resource.id)
            toast.success('Resource deleted')

            navigate('/resources')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed')
            throw err
        }
    }

    useEffect(() => {
        fetchResource()

        // ✅ Only fetch QR if admin
        if (isAdmin) {
            fetchQR()
        }
    }, [id, isAdmin])

    const fetchResource = async () => {
        try {
            const res = await resourceService.getById(id)
            setResource(res.data)
        } finally {
            setLoading(false)
        }
    }

    const fetchQR = async () => {
        try {
            const res = await resourceService.getQR(id)
            const url = URL.createObjectURL(res.data)
            setQrUrl(url)
        } catch { }
    }

    // ✅ Cleanup (pro-level fix)
    useEffect(() => {
        return () => {
            if (qrUrl) URL.revokeObjectURL(qrUrl)
        }
    }, [qrUrl])

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            </Layout>
        )
    }

    if (!resource) {
        return (
            <Layout>
                <div className="p-6 text-red-500">Resource not found</div>
            </Layout>
        )
    }

    // ✅ Determine if right side should exist
    const hasRightSide =
        (isAdmin && qrUrl) ||
        (resource.imageUrls?.length > 1)

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* HERO */}
                <div className="relative rounded-2xl overflow-hidden shadow">

                    {/* IMAGE */}
                    <div className="h-48 sm:h-56 md:h-64 bg-gray-100">
                        {resource.imageUrls?.[0] ? (
                            <img
                                src={resource.imageUrls[0]}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6 text-white">

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

                            {/* TITLE */}
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                                    {resource.name}
                                </h1>
                                <p className="text-xs sm:text-sm opacity-90 mt-1">
                                    {TYPE_LABELS[resource.type]}
                                </p>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-wrap gap-2 sm:justify-end">

                                {/* View Images */}
                                {resource.imageUrls?.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setCurrentIndex(0)
                                            setShowViewer(true)
                                        }}
                                        className="btn-secondary text-xs sm:text-sm px-3 py-2"
                                    >
                                        🖼 View Images
                                    </button>
                                )}

                                {/* Edit */}
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowEditOptions(true)}
                                        className="btn-primary text-xs sm:text-sm px-3 py-2"
                                    >
                                        ✏️ Edit
                                    </button>
                                )}
                                {/* Delete */}
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="btn-danger text-xs sm:text-sm px-3 py-2"
                                    >
                                        🗑 Delete
                                    </button>
                                )}

                            </div>

                        </div>
                    </div>
                </div>

                {/* STATUS */}
                <StatusBadge status={resource.status} />

                {/* MAIN GRID */}
                <div
                    className={`grid gap-6 transition-all duration-300 ${hasRightSide ? 'md:grid-cols-3' : 'md:grid-cols-1'
                        }`}
                >

                    {/* LEFT */}
                    <div
                        className={`space-y-6 ${hasRightSide ? 'md:col-span-2' : 'md:col-span-1'
                            }`}
                    >

                        <Card title="Overview">
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <Info icon="📍" label="Location" value={resource.location} />
                                <Info icon="🏢" label="Building" value={resource.building || '-'} />
                                <Info icon="⬆️" label="Floor" value={resource.floor || '-'} />
                                <Info icon="👥" label="Capacity" value={resource.capacity || '-'} />
                            </div>
                        </Card>

                        <Card title="Available Time Slots">
                            {resource.availabilityWindows?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {resource.availabilityWindows.map((slot, i) => (
                                        <span key={i} className="tag">
                                            {slot}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">
                                    No time slots configured for this resource
                                </p>
                            )}
                        </Card>

                        {resource.type === 'EQUIPMENT' && (
                            <Card title="Equipment Information">
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <Info label="Serial Number" value={resource.serialNumber || '-'} />
                                    <Info label="Manufacturer" value={resource.manufacturer || '-'} />
                                </div>
                            </Card>
                        )}

                        <Card title="About this resource">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {resource.description || 'No additional details provided.'}
                            </p>
                        </Card>

                    </div>

                    {/* RIGHT (ONLY IF EXISTS) */}
                    {hasRightSide && (
                        <div className="space-y-6">

                            {isAdmin && qrUrl && (
                                <Card title="Quick Access QR">
                                    <div className="text-center">
                                        <img src={qrUrl} className="mx-auto w-36 mb-3" />
                                        <a
                                            href={qrUrl}
                                            download
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            Download QR Code
                                        </a>
                                    </div>
                                </Card>
                            )}

                        </div>
                    )}

                </div>

            </div>
            {showViewer && (
                <ImageViewer
                    images={resource.imageUrls}
                    index={currentIndex}
                    onClose={() => setShowViewer(false)}
                    onChange={setCurrentIndex}
                />
            )}

            {showEditOptions && (
                <EditOptionsModal
                    imageCount={resource?.imageUrls?.length || 0}
                    onClose={() => setShowEditOptions(false)}
                    onSelect={(mode) => {
                        setEditMode(mode)
                        setShowEditOptions(false)
                    }}
                />
            )}

            {editMode === 'details' && (
                <ResourceModal
                    show={true}
                    resource={resource}
                    onClose={() => setEditMode(null)}
                    onSubmit={handleUpdate}   // ✅ USE THIS
                />
            )}

            {editMode === 'images' && (
                <EditImagesModal
                    resource={resource}
                    onClose={() => setEditMode(null)}
                    onUpdated={() => {
                        setEditMode(null)
                        fetchResource()
                    }}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDeleteResource}
                />
            )}


        </Layout>
    )
}

/* ---------- UI COMPONENTS ---------- */

function Card({ title, children }) {
    return (
        <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
            {children}
        </div>
    )
}

function Info({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            {icon && <span>{icon}</span>}
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-800">{value}</p>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const colors = {
        ACTIVE: 'bg-green-100 text-green-700',
        OUT_OF_SERVICE: 'bg-red-100 text-red-700',
        UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-700',
    }

    return (
        <span className={`badge ${colors[status]}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    )
}

function ImageViewer({ images, index, onClose, onChange }) {

    const prev = () => {
        onChange((index - 1 + images.length) % images.length)
    }

    const next = () => {
        onChange((index + 1) % images.length)
    }

    // keyboard support
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') prev()
            if (e.key === 'ArrowRight') next()
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [index])

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">

            {/* CLOSE */}
            <button
                onClick={onClose}
                className="absolute top-4 right-6 text-white text-3xl"
            >
                ✕
            </button>

            {/* LEFT ARROW */}
            {images.length > 1 && (
                <button
                    onClick={prev}
                    className="absolute left-4 text-white text-6xl"
                >
                    ‹
                </button>
            )}

            {/* IMAGE */}
            <img
                src={images[index]}
                className="max-h-[80%] max-w-[90%] object-contain rounded-lg shadow-lg"
            />

            {/* RIGHT ARROW */}
            {images.length > 1 && (
                <button
                    onClick={next}
                    className="absolute right-4 text-white text-6xl"
                >
                    ›
                </button>
            )}

            {/* INDEX */}
            <div className="absolute bottom-4 text-white text-sm">
                {index + 1} / {images.length}
            </div>

        </div>
    )
}

function EditOptionsModal({ imageCount = 0, onClose, onSelect }) {
    const maxImages = 5
    const isFull = imageCount >= maxImages

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">

                <h2 className="text-lg font-bold">Edit Resource</h2>

                <button
                    onClick={() => onSelect('details')}
                    className="btn-primary w-full"
                >
                    Update Details
                </button>

                {/* ✅ ALWAYS ENABLED */}
                <button
                    onClick={() => onSelect('images')}
                    className="btn-secondary w-full"
                >
                    {isFull ? 'Manage Images (Limit Reached)' : 'Update Images'}
                </button>

                <button
                    onClick={onClose}
                    className="w-full text-sm text-gray-400 mt-2"
                >
                    Cancel
                </button>

            </div>
        </div>
    )
}

function EditImagesModal({ resource, onClose, onUpdated }) {
    const [files, setFiles] = useState([])
    const [existing, setExisting] = useState(resource.imageUrls || [])
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const MAX = 5

    // ✅ DELETE EXISTING IMAGE (API)
    const handleDeleteImage = async (url) => {
        try {
            setDeleting(true)
            await resourceService.deleteImage(resource.id, url)
            // remove instantly from UI
            setExisting(prev => prev.filter(img => img !== url))

            toast.success('Image removed')
        } catch {
            toast.error('Delete failed')
        } finally {
            setDeleting(false)
        }
    }

    // ✅ UPLOAD NEW IMAGES
    const handleSubmit = async () => {
        try {
            setUploading(true)

            await resourceService.uploadImages(resource.id, files)

            toast.success('Images updated')
            onUpdated()
        } catch {
            toast.error('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const total = existing.length + files.length
    const canAddMore = total < MAX

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-fit rounded-2xl p-6">

                <h2 className="text-xl font-bold mb-4">Update Images</h2>

                {/* Changed overflow-x-auto to flex-wrap. 
            This prevents the '×' buttons from being clipped. */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">

                    {/* EXISTING IMAGES */}
                    {existing.map((url, i) => (
                        <div key={url} className="relative w-20 h-20">
                            <img
                                src={url}
                                className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                                alt="Existing"
                            />
                            <button
                                onClick={() => handleDeleteImage(url)}
                                disabled={deleting}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* NEW FILES */}
                    {files.map((file, i) => (
                        <div key={i} className="relative w-20 h-20">
                            <img
                                src={URL.createObjectURL(file)}
                                className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                                alt="New upload"
                            />
                            <button
                                onClick={() =>
                                    setFiles(prev => prev.filter((_, idx) => idx !== i))
                                }
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* ADD BUTTON */}
                    {canAddMore && (
                        <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-gray-400 transition-all">
                            <span className="text-2xl">+</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    if (total + newFiles.length > MAX) {
                                        toast.error(`Max ${MAX} images allowed`);
                                        return;
                                    }
                                    setFiles(prev => [...prev, ...newFiles]);
                                }}
                            />
                        </label>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={uploading || (files.length === 0 && !deleting)}
                        className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all"
                    >
                        {uploading ? 'Updating...' : 'Save Images'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function DeleteConfirmModal({ onCancel, onConfirm }) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        try {
            setLoading(true)
            await onConfirm()
            onCancel()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">

                <h2 className="text-lg font-bold text-red-600">
                    Delete Resource
                </h2>

                <p className="text-sm text-gray-600">
                    Are you sure you want to delete this resource? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2 pt-4 border-t">

                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        No, Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        {loading ? 'Deleting...' : 'Yes, Delete'}
                    </button>

                </div>
            </div>
        </div>
    )
}