'use client'

import React, { useEffect, useRef } from 'react'

interface DraggableCardProps {
  children: React.ReactNode
  onDragEnd?: (x: number, y: number) => void
  initialPosition?: { x: number, y: number }
}

export function DraggableCard({ children, onDragEnd, initialPosition = { x: 0, y: 0 } }: DraggableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const draggableInstance = useRef<any>(null)

  useEffect(() => {
    let active = true

    const initDraggable = async () => {
      if (typeof window !== 'undefined' && cardRef.current) {
        const Draggable = (await import('draggable')).default || await import('draggable')
        
        if (!active) return

        draggableInstance.current = new (Draggable as any)(cardRef.current, {
          grid: 10,
          smoothDrag: true,
          useGPU: true,
          setPosition: true,
          onDragEnd: (el: any, x: number, y: number) => {
            if (onDragEnd) onDragEnd(x, y)
          }
        })
        
        // Set initial position
        if (initialPosition.x !== 0 || initialPosition.y !== 0) {
           draggableInstance.current.set(initialPosition.x, initialPosition.y)
        }
      }
    }

    initDraggable()

    return () => {
      active = false
      if (draggableInstance.current) {
        draggableInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div ref={cardRef} className="cursor-move absolute z-50">
      {children}
    </div>
  )
}
