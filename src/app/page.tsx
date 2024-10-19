'use client'
import CollectionComponent from '@/components/CollectionComponent';
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Menu, X, Instagram, Send, ArrowUp } from 'lucide-react'
import Background from '../components/Background'

const navigationButtons = [
  { label: "Creative Market", href: "https://creativemarket.com/surreal66" },
  { label: "Adobe Stock", href: "https://stock.adobe.com/ua/contributor/207290474/surreal66" },
  { label: "Shutterstock", href: "https://www.shutterstock.com/ru/g/katshko?rid=3789533" },
  { label: "Behance", href: "https://www.behance.net/surreal66" },
]

const photoButtons = [
  { label: "Contact Form", action: "popup" },
  { label: "Order on Upwork", href: "https://www.upwork.com/freelancers/~0126ac45fd71aca6fd" },
  { label: "Dribble", href: "https://dribbble.com/galunga_art" },
  { label: "Redbubble", href: "https://www.redbubble.com/people/galunga-art/shop" },
]

export default function Home() {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false)
  const [rightMenuOpen, setRightMenuOpen] = useState(false)
  const [logoEnlarged, setLogoEnlarged] = useState(false)
  const [photoEnlarged, setPhotoEnlarged] = useState(false)
  const [logoGlowing, setLogoGlowing] = useState(false)
  const [photoGlowing, setPhotoGlowing] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null)
  const leftMenuRef = useRef<HTMLDivElement>(null)
  const rightMenuRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (setGlowing: React.Dispatch<React.SetStateAction<boolean>>) => {
    setGlowing(true)
  }

  const handleMouseLeave = (setGlowing: React.Dispatch<React.SetStateAction<boolean>>) => {
    setGlowing(false)
  }

  const handleImageClick = (setEnlarged: React.Dispatch<React.SetStateAction<boolean>>) => {
    setEnlarged(prev => !prev)
  }

  const closeMenus = () => {
    setLeftMenuOpen(false)
    setRightMenuOpen(false)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (leftMenuRef.current && !leftMenuRef.current.contains(event.target as Node) &&
        rightMenuRef.current && !rightMenuRef.current.contains(event.target as Node) &&
        logoRef.current && !logoRef.current.contains(event.target as Node) &&
        photoRef.current && !photoRef.current.contains(event.target as Node)) {
      closeMenus()
    }
  }

  const resetMenuTimer = () => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    menuTimerRef.current = setTimeout(closeMenus, 3000)
  }

  const handleScroll = () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight
    const currentScroll = window.pageYOffset
    const scrollPercentage = (currentScroll / totalScroll) * 100
    setScrollProgress(scrollPercentage)

    if (currentScroll > 300) {
      setShowScrollTop(true)
    } else {
      setShowScrollTop(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (leftMenuOpen || rightMenuOpen) {
      resetMenuTimer()
    } else {
      if (menuTimerRef.current) clearTimeout(menuTimerRef.current)
    }
  }, [leftMenuOpen, rightMenuOpen])

  return (
    <div className="relative z-10 flex flex-col min-h-screen overflow-hidden">
      <Background audioTracks={[]} className="fixed inset-0 z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 w-full h-1 bg-pink-100 z-[100]">
          <div 
            className="h-full bg-pink-300 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
            role="progressbar"
            aria-valuenow={scrollProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>

        <header className="sticky top-0 bg-transparent z-70 p-4">
          <div className="container mx-auto flex justify-between items-start px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <div 
                ref={logoRef}
                className={`w-[15vw] aspect-square relative mb-4 transition-all duration-300 ease-in-out ${logoEnlarged ? 'scale-125' : ''}`}
                onMouseEnter={() => handleMouseEnter(setLogoGlowing)}
                onMouseLeave={() => handleMouseLeave(setLogoGlowing)}
                onClick={() => handleImageClick(setLogoEnlarged)}
              >
                <div className={`w-full h-full rounded-full overflow-hidden`}>
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/galunga%20art%20(1)-jsQKL1flt45GytQJ24IukHDphe4mhe.png"
                    alt="Galunga Art Graphic Design Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectFit: "contain",
                    }}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="h-8"></div>
              <button 
                className="z-50 p-2 bg-white bg-opacity-35 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                onClick={() => setLeftMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                ref={photoRef}
                className={`w-[15vw] aspect-square relative mb-4 transition-all duration-300 ease-in-out ${photoEnlarged ? 'scale-125' : ''}`}
                onMouseEnter={() => handleMouseEnter(setPhotoGlowing)}
                onMouseLeave={() => handleMouseLeave(setPhotoGlowing)}
                onClick={() => handleImageClick(setPhotoEnlarged)}
              >
                <div className={`w-full h-full rounded-full overflow-hidden`}>
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD%20%D0%B1%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%20(11)-r279cuLwRnIUuuuF2YbfKlk4l2w4r8.png"
                    alt="Portrait of a young woman with blonde wavy hair and blue eyes"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full opacity-90"
                  />
                </div>
                <div className={`absolute bottom-0 left-0 right-0 flex justify-center space-x-4 transition-all duration-500 ease-in-out ${photoGlowing ? 'translate-y-full opacity-100' : 'translate-y-0 opacity-0'}`}>
                  <a href="https://t.me/lasgalungas" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full transition-all duration-300 ease-in-out hover:scale-125">
                    <Send size={24} className="text-gray-300 hover:text-gray-400" />
                  </a>
                  <a href="https://www.instagram.com/kate.galunga.art/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full transition-all duration-300 ease-in-out hover:scale-125">
                    <Instagram size={24} className="text-gray-300 hover:text-gray-400" />
                  </a>
                </div>
              </div>
              <div className="h-8"></div>
              <button 
                className="z-50 p-2 bg-white bg-opacity-35 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                onClick={() => setRightMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow px-4 md:px-20 py-8">
          <h1 className="text-4xl font-bold mb-8">Galunga Art</h1>
          <p className="text-lg mb-4">digital art and designs</p>
          <CollectionComponent />
        </main>
        
        <footer className="bg-transparent z-50 p-4">
          <div className="container mx-auto text-center">
            <p className="text-sm text-gray-600">designed by whozhaysho</p>
          </div>
        </footer>
      </div>

      <div 
        ref={leftMenuRef}
        className={`fixed top-0 left-0 h-full w-64 bg-pink-100 bg-opacity-35 z-50 transform transition-transform duration-300 ease-in-out ${leftMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onMouseMove={resetMenuTimer}
      >
        <button 
          className="fixed top-4 left-4 z-60 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
          onClick={() => setLeftMenuOpen(false)}
        >
          <X size={24} />
        </button>
        <div className="flex flex-col space-y-4 p-4 pt-20">
          {navigationButtons.map((button, index) => (
            <a
              key={index}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-white bg-opacity-75 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-pink-200 text-center"
            >
              <span className="text-sm font-medium text-gray-700 hover:text-gray-900">{button.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div 
        ref={rightMenuRef}
        className={`fixed top-0 right-0 h-full w-64 bg-pink-100 bg-opacity-35 z-50 transform transition-transform duration-300 ease-in-out ${rightMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onMouseMove={resetMenuTimer}
      >
        <button 
          className="fixed top-4 right-4 z-60 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
          onClick={() => setRightMenuOpen(false)}
        >
          <X size={24} />
        </button>
        <div className="flex flex-col space-y-4 p-4 pt-20">
          {photoButtons.map((button, index) => (
            button.action === "popup" ? (
              <button
                key={index}
                onClick={() => {}}
                className="block w-full px-4 py-2 bg-white bg-opacity-75 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-pink-200 text-center"
              >
                <span className="text-sm font-medium text-gray-700 hover:text-gray-900">{button.label}</span>
              </button>
            ) : (
              <a
                key={index}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-white bg-opacity-75 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-pink-200 text-center"
              >
                <span className="text-sm font-medium text-gray-700 hover:text-gray-900">{button.label}</span>
              </a>
            )
          ))}
        </div>
      </div>

      <button
        className={`fixed bottom-8 right-8 p-2 bg-pink-200 text-pink-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  )
}