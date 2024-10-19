"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RECTANGLE_WIDTH = 60
const RECTANGLE_HEIGHT = 30
const SPREAD_RADIUS = 500
const MAX_SPREAD_DISTANCE = 7.5
const NUM_PETALS = 40
const NUM_BUTTERFLIES = 30
const WAVE_DURATION = 3 // seconds
const WAVE_DELAY_FACTOR = 0.035 // seconds
const WAVE_AMPLITUDE = 10 // pixels

type GridSize = { columns: number; rows: number }
type Petal = { id: number; left: number; delay: number; duration: number; size: number }
type Butterfly = { id: number; startX: number; startY: number; size: number; duration: number; delay: number }

const ButterflyIcon = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20C60 10 80 10 90 20C100 30 90 50 80 60C70 70 60 80 50 90C40 80 30 70 20 60C10 50 0 30 10 20C20 10 40 10 50 20Z" stroke={color} strokeWidth="2"/>
  </svg>
)

const MemoizedButterfly = React.memo(({ butterfly }: { butterfly: Butterfly }) => (
  <motion.div
    className="absolute"
    initial={{ 
      x: butterfly.startX, 
      y: butterfly.startY, 
      opacity: 0,
      scale: 0
    }}
    animate={{
      x: [butterfly.startX, butterfly.startX - 50, butterfly.startX + 50, butterfly.startX],
      y: [butterfly.startY, 0],
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      rotate: [0, 15, -15, 0, 15, -15, 0]
    }}
    transition={{
      duration: butterfly.duration,
      delay: butterfly.delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 5
    }}
  >
    <ButterflyIcon size={butterfly.size} color="#FBCFE8" />
  </motion.div>
))

MemoizedButterfly.displayName = 'MemoizedButterfly'

interface BackgroundEffectsProps {
  audioTracks: string[];
  className?: string;
}

export default function BackgroundEffectsTest({ audioTracks = [], className = '' }: BackgroundEffectsProps) {
  const [gridSize, setGridSize] = useState<GridSize>({ columns: 0, rows: 0 })
  const [interactionPosition, setInteractionPosition] = useState<{ x: number, y: number } | null>(null)
  const [petals, setPetals] = useState<Petal[]>([])
  const [butterflies, setButterflies] = useState<Butterfly[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [lastInteractionPosition, setLastInteractionPosition] = useState<{ x: number, y: number } | null>(null); // Added state for last interaction position
  const audioRef = useRef<HTMLAudioElement>(null)
  const interactionRef = useRef<{ x: number, y: number } | null>(null)
  const animationFrameId = useRef<number | null>(null)

  const updateGridSize = useCallback(() => {
    const columns = Math.ceil(window.innerWidth / RECTANGLE_WIDTH)
    const rows = Math.ceil(window.innerHeight / RECTANGLE_HEIGHT)
    setGridSize({ columns, rows })
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    updateGridSize()
    window.addEventListener('resize', () => {
      checkMobile()
      updateGridSize()
    })
    return () => window.removeEventListener('resize', updateGridSize)
  }, [updateGridSize])

  useEffect(() => {
    const newPetals = Array.from({ length: NUM_PETALS }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      size: 5 + Math.random() * 10
    }))
    setPetals(newPetals)

    const newButterflies = Array.from({ length: NUM_BUTTERFLIES }, (_, i) => ({
      id: i,
      startX: Math.random() * window.innerWidth,
      startY: window.innerHeight + Math.random() * 100,
      size: 15 + Math.random() * 15,
      duration: 20 + Math.random() * 10,
      delay: Math.random() * 10
    }))
    setButterflies(newButterflies)
  }, [])

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = (e as React.MouseEvent).clientX - rect.left
      y = (e as React.MouseEvent).clientY - rect.top
    }
    setLastInteractionPosition({ x, y }) // Update lastInteractionPosition
    interactionRef.current = { x, y }
  }, [])

  const handleInteractionEnd = useCallback(() => {
    interactionRef.current = null
  }, [])

  useEffect(() => {
    const updateInteractionPosition = () => {
      if (interactionRef.current) {
        setInteractionPosition(interactionRef.current)
      }
      animationFrameId.current = requestAnimationFrame(updateInteractionPosition)
    }
    updateInteractionPosition()
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  const toggleAudio = useCallback(() => {
    if (audioRef.current && audioTracks.length > 0) {
      if (audioRef.current.paused) {
        audioRef.current.play()
        setIsPlaying(true)
      } else {
        audioRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [audioTracks])

  const changeTrack = useCallback(() => {
    if (audioTracks.length > 0) {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % audioTracks.length)
    }
  }, [audioTracks])

  useEffect(() => {
    if (audioRef.current && audioTracks.length > 0) {
      audioRef.current.src = audioTracks[currentTrackIndex]
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrackIndex, audioTracks, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('ended', changeTrack)
      return () => {
        audio.removeEventListener('ended', changeTrack)
      }
    }
  }, [changeTrack])

  const getRectangleStyle = useCallback((column: number, row: number) => {
    let translateX = 0
    let translateY = 0

    if (lastInteractionPosition) { // Use lastInteractionPosition
      const rectCenterX = (column + 0.5) * RECTANGLE_WIDTH
      const rectCenterY = (row + 0.5) * RECTANGLE_HEIGHT
      const dx = rectCenterX - lastInteractionPosition.x
      const dy = rectCenterY - lastInteractionPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < SPREAD_RADIUS) {
        const angle = Math.atan2(dy, dx)
        const force = Math.pow((SPREAD_RADIUS - distance) / SPREAD_RADIUS, 2)
        const spreadDistance = MAX_SPREAD_DISTANCE * force
        translateX = Math.cos(angle) * spreadDistance
        translateY = Math.sin(angle) * spreadDistance
      }
    }

    const baseDelay = (column + row) * WAVE_DELAY_FACTOR
    return {
      '--translate-x': `${translateX}px`,
      '--translate-y': `${translateY}px`,
      '--wave-delay': `${baseDelay}s`,
    } as React.CSSProperties
  }, [lastInteractionPosition]) // Add lastInteractionPosition to dependencies

  const rectangles = useMemo(() => {
    return Array.from({ length: gridSize.columns * gridSize.rows }).map((_, index) => {
      const column = index % gridSize.columns
      const row = Math.floor(index / gridSize.columns)
      return (
        <div key={index} className="relative w-full h-full">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white to-pink-100 border border-gray-200 combined-animation"
            style={getRectangleStyle(column, row)}
          />
        </div>
      )
    })
  }, [gridSize, getRectangleStyle])

  return (
    <div className={`relative z-10 absolute inset-0 overflow-hidden bg-pink-100 ${className}`}>
      <div
        className="absolute inset-0"
        onMouseMove={isMobile ? undefined : handleInteraction}
        onTouchMove={handleInteraction}
        onMouseLeave={handleInteractionEnd}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
      >
        <div 
          className="grid absolute inset-0"
          style={{
            gridTemplateColumns: `repeat(${gridSize.columns}, ${RECTANGLE_WIDTH}px)`,
            gridTemplateRows: `repeat(${gridSize.rows}, ${RECTANGLE_HEIGHT}px)`,
          }}
        >
          {rectangles}
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {petals.map(petal => (
            <div
              key={petal.id}
              className="absolute bg-pink-200"
              style={{
                left: `${petal.left}%`,
                top: '-5%',
                width: `${petal.size}px`,
                height: `${petal.size / 2}px`,
                borderRadius: '50% 50% 50% 0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                animation: `fallQuarter ${petal.duration}s linear ${petal.delay}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <AnimatePresence>
            {butterflies.map(butterfly => (
              <MemoizedButterfly key={butterfly.id} butterfly={butterfly} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <audio ref={audioRef} />
      <button
        onClick={toggleAudio}
        className="fixed left-4 bottom-4 md:left-10 md:bottom-10 z-50 p-2 rounded-full hover:bg-opacity-10 transition-all duration-300"
      >
        {isPlaying ? <Volume2 size={24} className="text-gray-500 opacity-30" /> : <VolumeX size={24} className="text-gray-500 opacity-30" />}
      </button>

      <style jsx>{`
        @keyframes fallQuarter {
          0% {
            transform: translateY(-5%) rotate(0deg);
          }
          100% {
            transform: translateY(105vh) rotate(720deg) translateX(-5%);
          }
        }
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) translate(var(--translate-x), var(--translate-y));
          }
          50% {
            transform: translateY(-${WAVE_AMPLITUDE}px) translate(var(--translate-x), var(--translate-y));
          }
        }
        .combined-animation {
          animation: wave ${WAVE_DURATION}s infinite ease-in-out;
          animation-delay: var(--wave-delay);
          transform: translate(var(--translate-x), var(--translate-y));
          transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
        }
      `}</style>
    </div>
  )
}