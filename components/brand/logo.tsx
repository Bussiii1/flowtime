import React from 'react'

export function Logo({ className = "h-8 w-8", textClassName = "text-xl" }: { className?: string, textClassName?: string }) {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className={`relative ${className} transition-transform group-hover:scale-110 duration-500`}>
        {/* The Wave */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
          <path 
            d="M20 60C35 45 45 45 60 60C75 75 85 75 100 60V100H0V60C5 55 10 55 20 60Z" 
            fill="#4ECDC4" 
            className="animate-pulse"
          />
          <path 
            d="M0 70C15 55 25 55 40 70C55 85 65 85 80 70C95 55 100 55 100 60V100H0V70Z" 
            fill="#FF6B6B" 
            fillOpacity="0.8"
          />
        </svg>
        {/* The Clock Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 flex items-center justify-center">
          <div className="w-1 h-3 bg-primary rounded-full absolute top-1.5 origin-bottom animate-[spin_10s_linear_infinite]" />
          <div className="w-1 h-2 bg-secondary rounded-full absolute top-2.5 origin-bottom animate-[spin_60s_linear_infinite]" />
        </div>
      </div>
      <span className={`font-black tracking-tighter ${textClassName}`}>
        Flow<span className="text-primary">Time</span>
      </span>
    </div>
  )
}
