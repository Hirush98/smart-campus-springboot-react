import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { resourceService } from '../services/api'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

const TYPE_LABELS = {
    LECTURE_HALL: 'Lecture Hall',
    LAB: 'Lab',
    MEETING_ROOM: 'Meeting Room',
    EQUIPMENT: 'Equipment',
}

export default function ResourceDetailsPage() {
    const { id } = useParams()
    const { isAdmin } = useAuth()

    const [resource, setResource] = useState(null)
    const [loading, setLoading] = useState(true)
    const [qrUrl, setQrUrl] = useState(null)
    const [showViewer, setShowViewer] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

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
                                    <button className="btn-primary text-xs sm:text-sm px-3 py-2">
                                        ✏️ Edit
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