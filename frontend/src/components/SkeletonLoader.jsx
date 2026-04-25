import React from 'react'

export const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 animate-pulse rounded-md ${className}`} />
)

export const CardSkeleton = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
)

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 py-3 border-b border-slate-50">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
)
