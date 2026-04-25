import { useState, useEffect } from "react"

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

export default function AvailabilityPicker({ value, onChange }) {
  const [data, setData] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null)
  
  useEffect(() => {
    setData(value || {})
  }, [value])

  const updateSlot = (day, hour, mode) => {
    const daySlots = data[day] || []
    const exists = daySlots.some(s => s.start === hour)
    
    let updatedData
    if (mode === 'remove' && exists) {
      updatedData = { ...data, [day]: daySlots.filter(s => s.start !== hour) }
    } else if (mode === 'add' && !exists) {
      updatedData = { ...data, [day]: [...daySlots, { start: hour, end: hour + 1 }] }
    } else {
      return
    }

    setData(updatedData)
    onChange?.(updatedData)
  }

  const handleMouseDown = (day, hour) => {
    const isActive = (data[day] || []).some(s => s.start === hour)
    setDragMode(isActive ? 'remove' : 'add')
    setIsDragging(true)
    updateSlot(day, hour, isActive ? 'remove' : 'add')
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden select-none shadow-sm">
      <div className="p-4 sm:p-5">
        
        {/* Compact Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Availability</h4>
          </div>
          <div className="flex gap-3 text-[10px] font-medium text-slate-500 uppercase">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-indigo-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-slate-100 border border-slate-200" />
              <span>Off</span>
            </div>
          </div>
        </div>

        {/* Responsive Scroll Container */}
        <div className="overflow-x-auto scrollbar-hide border border-slate-100 rounded-lg">
          <div className="grid grid-cols-[40px_repeat(13,minmax(35px,1fr))] min-w-[580px]">
            
            {/* Header: Time Labels */}
            <div className="bg-slate-50/50 border-b border-r border-slate-100" />
            {HOURS.map(h => (
              <div key={h} className="py-1.5 text-center bg-slate-50/50 border-b border-r border-slate-100 last:border-r-0">
                <span className="text-[9px] font-semibold text-slate-400">
                  {h > 12 ? `${h-12}p` : h === 12 ? '12p' : `${h}a`}
                </span>
              </div>
            ))}

            {/* Rows */}
            {DAYS.map((day) => (
              <div key={day} className="contents">
                {/* Day Label */}
                <div className="flex items-center justify-center text-[9px] font-bold text-slate-400 bg-slate-50/30 border-b border-r border-slate-100">
                  {day}
                </div>

                {/* Hour Cells */}
                {HOURS.map((hour) => {
                  const active = (data[day] || []).some(s => hour >= s.start && hour < s.end)
                  return (
                    <button
                      key={`${day}-${hour}`}
                      type="button"
                      onMouseDown={() => handleMouseDown(day, hour)}
                      onMouseEnter={() => isDragging && updateSlot(day, hour, dragMode)}
                      className={`
                        h-9 border-b border-r border-slate-100 transition-colors last:border-r-0
                        ${active ? "bg-indigo-500 border-indigo-600/20" : "bg-white hover:bg-slate-50"}
                        ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
                      `}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-center sm:hidden">
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
            Swipe to see full hours
          </p>
        </div>
      </div>
    </div>
  )
}