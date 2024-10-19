'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronLeft, ChevronRight, X, Play, AlertTriangle, Camera, Tag, Upload, Link as LinkIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSwipeable } from 'react-swipeable'

type MediaItem = {
  id: string;
  type: 'image' | 'video' | 'youtube';
  src: string;
  thumbnail?: string;
  title: string;
  tags: string[];
  metadata: Record<string, string>;
}

type CollectionBlock = {
  id: string;
  name: string;
  coverMedia: MediaItem;
  media: MediaItem[];
}

const generatePlaceholderMedia = (count: number): MediaItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `placeholder-${i + 1}`,
    type: 'image',
    src: `/placeholder.svg?height=200&width=200`,
    title: `Placeholder ${i + 1}`,
    tags: [],
    metadata: {},
  }));
};

const initialCollectionBlocks: CollectionBlock[] = Array.from({ length: 6 }, (_, i) => ({
  id: `collection-${i + 1}`,
  name: `Collection ${i + 1}`,
  coverMedia: {
    id: `cover-${i + 1}`,
    type: 'image',
    src: `/placeholder.svg?height=400&width=400`,
    title: `Cover ${i + 1}`,
    tags: [],
    metadata: {},
  },
  media: generatePlaceholderMedia(10),
}));

type CollectionComponentProps = {
  items?: CollectionBlock[];
}

export default function Component({ items }: CollectionComponentProps) {
  const [collectionBlocks, setCollectionBlocks] = useState<CollectionBlock[]>(items || initialCollectionBlocks);
  const [layout, setLayout] = useState({ blockSize: 0, gap: 0, columns: 1 })
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupSize, setPopupSize] = useState(0)
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [enlargedMediaIndex, setEnlargedMediaIndex] = useState<number | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [changedBlocks, setChangedBlocks] = useState<Set<string>>(new Set());
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
  };

  useEffect(() => {
    const updateLayout = () => {
      const vh = window.innerHeight
      const vw = window.innerWidth
      const containerWidth = vw * 0.8
      const containerHeight = vh * 0.8
      const visibleRows = 2

      let blockSize = containerHeight / visibleRows
      const gap = blockSize * 0.05
      blockSize = (containerHeight - gap) / visibleRows

      let columns = Math.floor((containerWidth + gap) / (blockSize + gap))
      columns = Math.max(1, Math.min(columns, 4))

      blockSize = (containerWidth - (columns - 1) * gap) / columns

      setLayout({
        blockSize: Math.min(blockSize, vh * 0.4),
        gap: gap,
        columns: columns
      })

      const minViewportDimension = Math.min(window.innerWidth, window.innerHeight)
      setPopupSize(minViewportDimension * 0.9)
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowPasswordDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAdminMode(true);
      setShowPasswordDialog(false);
    } else {
      alert('Неверный пароль');
    }
    setPassword('');
  };

  const handleBlockClick = (index: number) => {
    setCurrentBlockIndex(index)
    setIsPopupOpen(true)
    setCurrentMediaIndex(0)
    setChangedBlocks(new Set(changedBlocks))
  }

  const handleClosePopup = () => {
    if (enlargedMediaIndex !== null) {
      setEnlargedMediaIndex(null)
    } else {
      setIsPopupOpen(false)
    }
  }

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => 
      prevIndex === 0 ? collectionBlocks[currentBlockIndex].media.length - 1 : prevIndex - 1
    )
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => 
      (prevIndex + 1) % collectionBlocks[currentBlockIndex].media.length
    )
  }

  const handleMediaClick = (index: number) => {
    setEnlargedMediaIndex(index)
  }

  const addMoreBlocks = () => {
    if (collectionBlocks.length < 12) {
      const newBlock: CollectionBlock = {
        id: `collection-${collectionBlocks.length + 1}`,
        name: `Collection ${collectionBlocks.length + 1}`,
        coverMedia: {
          id: `cover-${collectionBlocks.length + 1}`,
          type: 'image',
          src: `/placeholder.svg?height=400&width=400`,
          title: `Cover ${collectionBlocks.length + 1}`,
          tags: [],
          metadata: {},
        },
        media: generatePlaceholderMedia(10),
      };
      setCollectionBlocks([...collectionBlocks, newBlock]);
      setChangedBlocks(prev => new Set(prev).add(newBlock.id));
    }
  };

  const addMoreSlides = (blockIndex: number) => {
    if (collectionBlocks[blockIndex].media.length < 20) {
      const newMedia = generatePlaceholderMedia(1)[0];
      const updatedBlocks = [...collectionBlocks];
      updatedBlocks[blockIndex].media.push(newMedia);
      setCollectionBlocks(updatedBlocks);
      setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
    }
  };

  const handleFileUpload = (blockIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedBlocks = [...collectionBlocks];
        const newMedia: MediaItem = {
          id: `media-${Date.now()}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          src: e.target?.result as string,
          title: file.name,
          tags: [],
          metadata: {},
        };
        if (newMedia.type === 'video') {
          const video = document.createElement('video');
          video.src = newMedia.src;
          video.addEventListener('loadeddata', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            newMedia.thumbnail = canvas.toDataURL('image/jpeg');
            updatedBlocks[blockIndex].media.push(newMedia);
            setCollectionBlocks(updatedBlocks);
            setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
          });
        } else {
          updatedBlocks[blockIndex].media.push(newMedia);
          setCollectionBlocks(updatedBlocks);
          setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (blockIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedBlocks = [...collectionBlocks];
        const newCoverMedia: MediaItem = {
          id: `cover-${Date.now()}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          src: e.target?.result as string,
          title: file.name,
          tags: [],
          metadata: {},
        };
        if (newCoverMedia.type === 'video') {
          const video = document.createElement('video');
          video.src = newCoverMedia.src;
          video.addEventListener('loadeddata', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            newCoverMedia.thumbnail = canvas.toDataURL('image/jpeg');
            updatedBlocks[blockIndex].coverMedia = newCoverMedia;
            setCollectionBlocks(updatedBlocks);
            setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
          });
        } else {
          updatedBlocks[blockIndex].coverMedia = newCoverMedia;
          setCollectionBlocks(updatedBlocks);
          setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleYouTubeUpload = (blockIndex: number, youtubeUrl: string) => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId) {
      const updatedBlocks = [...collectionBlocks];
      const newMedia: MediaItem = {
        id: `youtube-${Date.now()}`,
        type: 'youtube',
        src: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        title: `YouTube Video ${videoId}`,
        tags: [],
        metadata: {},
      };
      updatedBlocks[blockIndex].media.push(newMedia);
      setCollectionBlocks(updatedBlocks);
      setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddTag = (blockIndex: number, mediaIndex: number, tag: string) => {
    const updatedBlocks = [...collectionBlocks];
    if (!updatedBlocks[blockIndex].media[mediaIndex].tags.includes(tag)) {
      updatedBlocks[blockIndex].media[mediaIndex].tags.push(tag);
      setCollectionBlocks(updatedBlocks);
      setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
    }
  };

  const handleRemoveTag = (blockIndex: number, mediaIndex: number, tag: string) => {
    const updatedBlocks = [...collectionBlocks];
    updatedBlocks[blockIndex].media[mediaIndex].tags = updatedBlocks[blockIndex].media[mediaIndex].tags.filter(t => t !== tag);
    setCollectionBlocks(updatedBlocks);
    setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
  };

  const handleAddMetadata = (blockIndex: number, mediaIndex: number, key: string, value: string) => {
    const updatedBlocks = [...collectionBlocks];
    updatedBlocks[blockIndex].media[mediaIndex].metadata[key] = value;
    setCollectionBlocks(updatedBlocks);
    setChangedBlocks(prev => new Set(prev).add(collectionBlocks[blockIndex].id));
  };

  const saveBlockChanges = async (blockId: string) => {
    try {
      const blockToSave = collectionBlocks.find(block => block.id === blockId);
      if (!blockToSave) return;

      const response = await fetch(`/api/updateBlock/${blockId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blockToSave),
      });
      if (!response.ok) {
        throw new Error('Failed to save changes');
      }
      setChangedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-start bg-background">
      {isAdminMode && (
        <Button onClick={toggleAdminMode} className="mb-4 mt-4">
          Выключить режим администратора
        </Button>
      )}
      <div className="w-[80vw] h-[80vh] overflow-y-auto overflow-x-hidden">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.columns}, ${layout.blockSize}px)`,
            gap: `${layout.gap}px`,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {collectionBlocks.map((block, index) => (
            <CollectionBlock 
              key={block.id} 
              
              block={block} 
              size={layout.blockSize}
              onClick={() => handleBlockClick(index)}
              isEditing={isAdminMode} 
              onCoverUpload={(event) => handleCoverUpload(index, event)}
              changedBlocks={changedBlocks}
              saveBlockChanges={saveBlockChanges}
            />
          ))}
        </div>
        {isAdminMode && collectionBlocks.length < 12 && (
          <Button 
            onClick={addMoreBlocks}
            className="mt-4"
          >
            Add More Blocks
          </Button>
        )}
      </div>
      {isPopupOpen && collectionBlocks[currentBlockIndex] && (
        <Popup
          block={collectionBlocks[currentBlockIndex]}
          onClose={handleClosePopup}
          size={popupSize}
          currentMediaIndex={currentMediaIndex}
          onPrevMedia={handlePrevMedia}
          onNextMedia={handleNextMedia}
          onMediaClick={handleMediaClick}
          enlargedMediaIndex={enlargedMediaIndex}
          setEnlargedMediaIndex={setEnlargedMediaIndex}
          onAddSlide={() => addMoreSlides(currentBlockIndex)}
          totalSlides={collectionBlocks[currentBlockIndex].media.length}
          isEditing={isAdminMode} 
          onFileUpload={(event) => handleFileUpload(currentBlockIndex, event)}
          onYouTubeUpload={(url) => handleYouTubeUpload(currentBlockIndex, url)}
          onAddTag={(mediaIndex, tag) => handleAddTag(currentBlockIndex, mediaIndex, tag)}
          onRemoveTag={(mediaIndex, tag) => handleRemoveTag(currentBlockIndex, mediaIndex, tag)}
          onAddMetadata={(mediaIndex, key, value) => handleAddMetadata(currentBlockIndex, mediaIndex, key, value)}
          changedBlocks={changedBlocks}
          saveBlockChanges={saveBlockChanges}
        />
      )}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Введите пароль администратора</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <Button type="submit">Войти</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CollectionBlock({ block, size, onClick, isEditing, onCoverUpload, changedBlocks, saveBlockChanges }: { block: CollectionBlock; size: number; onClick: () => void; isEditing: boolean; onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; changedBlocks: Set<string>; saveBlockChanges: (blockId: string) => Promise<void> }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  return (
    <motion.div  
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
        transition: { duration: 0.3 }
      }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-lg shadow-lg overflow-hidden cursor-pointer relative"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
      }}
      onClick={onClick}
    >
      <div className="relative w-full h-full">
        {inView && (
          block.coverMedia.type === 'video' ? (
            <video
              src={block.coverMedia.src}
              poster={block.coverMedia.thumbnail}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={block.coverMedia.src}
              alt={`${block.name} collection cover`}
              layout="fill"
              objectFit="cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white text-lg md:text-2xl font-semibold">{block.name}</h3>
        </div>
      </div>
      {isEditing && (
        <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer">
          <input type="file" className="hidden" onChange={onCoverUpload} accept="image/*,video/*" />
          <Camera className="w-6 h-6 text-gray-600" />
        </label>
      )}
      {isEditing && changedBlocks.has(block.id) && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            saveBlockChanges(block.id);
          }}
          className="absolute top-2 right-2 z-10"
        >
          Save Changes
        </Button>
      )}
    </motion.div>
  )
}

function Popup({ block, onClose, size, currentMediaIndex, onPrevMedia, onNextMedia, onMediaClick, enlargedMediaIndex, setEnlargedMediaIndex, onAddSlide, totalSlides, isEditing, onFileUpload, onYouTubeUpload, onAddTag, onRemoveTag, onAddMetadata, changedBlocks, saveBlockChanges }: { block: CollectionBlock; onClose: () => void; size: number; currentMediaIndex: number; onPrevMedia: () => void; onNextMedia: () => void; onMediaClick: (index: number) => void; enlargedMediaIndex: number | null; setEnlargedMediaIndex: (index: number | null) => void; onAddSlide: () => void; totalSlides: number; isEditing: boolean; onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; onYouTubeUpload: (url: string) => void; onAddTag: (mediaIndex: number, tag: string) => void; onRemoveTag: (mediaIndex: number, tag: string) => void; onAddMetadata: (mediaIndex: number, key: string, value: string) => void; changedBlocks: Set<string>; saveBlockChanges: (blockId: string) => Promise<void> }) {
  const mainMediaSize = size * 0.7
  const thumbnailSize = size * 0.3
  const thumbnailGap = thumbnailSize * 0.05
  const rowGap = thumbnailSize * 0.1
  const bottomGap = thumbnailSize * 0.1
  const arrowSize = 36
  const closeButtonSize = 18

  const prevIndex = (currentMediaIndex - 1 + block.media.length) % block.media.length
  const nextIndex = (currentMediaIndex + 1) % block.media.length
  const nextNextIndex = (currentMediaIndex + 2) % block.media.length

  const handlers = useSwipeable({
    onSwipedLeft: onNextMedia,
    onSwipedRight: onPrevMedia,
    touchEventOptions: { passive: false },
    trackMouse: true
  });

  const NavigationButton = ({ onClick, children, className }) => {
    return (
      <motion.button 
        className={`absolute rounded-full p-2 flex items-center justify-center ${className}`}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.button>
    )
  }

  const handleEnlargedPrevMedia = () => {
    setEnlargedMediaIndex((prevIndex) => 
      prevIndex === 0 ? block.media.length - 1 : prevIndex - 1
    )
  }

  const handleEnlargedNextMedia = () => {
    setEnlargedMediaIndex((prevIndex) => 
      (prevIndex + 1) % block.media.length
    )
  }

  const swipeAnimation = {
    initial: { opacity: 0, x: 0 },
    animate: { 
      opacity: [0, 1, 1, 0],
      x: [-50, 0, 0, 50],
      transition: { 
        duration: 2,
        times: [0, 0.2, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div 
        className="bg-card rounded-lg shadow-xl overflow-hidden relative"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <NavigationButton
          onClick={onClose}
          className="top-0 right-0 text-gray-700"
          style={{
            top: '5px',
            right: '5px'
          }}
        >
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
            <X size={closeButtonSize} />
          </motion.div>
        </NavigationButton>
        <div className="flex flex-col items-center justify-between h-full py-4" {...handlers}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentMediaIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gray-200 rounded-lg overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
              style={{ 
                width: `${mainMediaSize}px`, 
                height: `${mainMediaSize}px`,
                marginBottom: `${rowGap}px`,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => onMediaClick(currentMediaIndex)}
            >
              {block.media[currentMediaIndex] && (
                <MediaItem item={block.media[currentMediaIndex]} />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="text-sm text-gray-500 mt-2">
            Editing Slide {currentMediaIndex + 1} of {block.media.length}
          </div>
          <div 
            className="flex justify-center space-x-2"
            style={{
              marginBottom: `${bottomGap}px`
            }}
          >
            {[prevIndex, nextIndex, nextNextIndex].map((index) => (
              <div 
                key={index} 
                className={`relative bg-gray-200 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer ${
                  index === currentMediaIndex ? 'ring-2 ring-primary' : ''
                }`}
                style={{ 
                  width: `${thumbnailSize}px`, 
                  height: `${thumbnailSize}px`,
                  marginRight: index !== nextNextIndex ? `${thumbnailGap}px` : '0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => onMediaClick(index)}
              >
                {block.media[index] && (
                  <MediaItem item={block.media[index]} isThumbnail />
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Editing Slide {currentMediaIndex + 1}: {block.media[currentMediaIndex].title}
              </h3>
              <div className="flex space-x-2 mb-4">
                {totalSlides < 20 && (
                  <Button
                    onClick={onAddSlide}
                    size="sm"
                    variant="outline"
                  >
                    Add Slide
                  </Button>
                )}
                <Label 
                  className="bg-primary text-primary-foreground px-3 py-1 rounded cursor-pointer"
                >
                  <input type="file" className="hidden" onChange={onFileUpload} accept="image/*,video/*" />
                  <Upload size={16} className="mr-2" />
                  Upload File
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <LinkIcon size={16} className="mr-2" />
                      Add YouTube Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add YouTube Video</DialogTitle>
                    </DialogHeader>
                    <YouTubeUploadForm onUpload={onYouTubeUpload} />
                  </DialogContent>
                </Dialog>
              </div>
              <TagInput 
                tags={block.media[currentMediaIndex].tags} 
                onAddTag={(tag) => onAddTag(currentMediaIndex, tag)}
                onRemoveTag={(tag) => onRemoveTag(currentMediaIndex, tag)}
              />
              <MetadataInput 
                metadata={block.media[currentMediaIndex].metadata}
                onAddMetadata={(key, value) => onAddMetadata(currentMediaIndex, key, value)}
              />
            </div>
          )}
          {isEditing && changedBlocks.has(block.id) && (
            <Button
              onClick={() => saveBlockChanges(block.id)}
              className="mt-4"
            >
              Save Changes
            </Button>
          )}
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-50 rounded-full px-4 py-2"
            variants={swipeAnimation}
            initial="initial"
            animate="animate"
          >
            <span className="text-gray-800">Swipe to navigate</span>
          </motion.div>
        </div>
        <NavigationButton
          onClick={onPrevMedia}
          className="left-0 top-1/2 transform -translate-y-1/2"
          style={{
            left: '15px',
          }}
        >
          <ChevronLeft size={arrowSize} className="text-gray-700" />
        </NavigationButton>
        <NavigationButton
          onClick={onNextMedia}
          className="right-0 top-1/2 transform -translate-y-1/2"
          style={{
            right: '15px',
          }}
        >
          <ChevronRight size={arrowSize} className="text-gray-700" />
        </NavigationButton>
      </div>
      {enlargedMediaIndex !== null && block.media[enlargedMediaIndex] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
        >
          <div 
            className="relative bg-white rounded-lg overflow-hidden"
            style={{
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <MediaItem item={block.media[enlargedMediaIndex]} enlarged />
            <NavigationButton
              onClick={onClose}
              className="top-0 right-0 text-gray-700"
              style={{
                top: '5px',
                right: '5px',
              }}
            >
              <X size={closeButtonSize} />
            </NavigationButton>
            <NavigationButton
              onClick={handleEnlargedPrevMedia}
              className="left-0 top-1/2 transform -translate-y-1/2 text-gray-700"
              style={{
                left: '15px',
              }}
            >
              <ChevronLeft size={arrowSize} />
            </NavigationButton>
            <NavigationButton
              onClick={handleEnlargedNextMedia}
              className="right-0 top-1/2 transform -translate-y-1/2 text-gray-700"
              style={{
                right: '15px',
              }}
            >
              <ChevronRight size={arrowSize} />
            </NavigationButton>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaItem({ item, isThumbnail = false, enlarged = false }: { item: MediaItem; isThumbnail?: boolean; enlarged?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isError, setIsError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('play', () => setIsPlaying(true))
      videoRef.current.addEventListener('pause', () => setIsPlaying(false))
    }
  }, [])

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <AlertTriangle className="text-red-500" size={isThumbnail ? 24 : 48} />
      </div>
    )
  }

  switch (item.type) {
    case 'image':
      return (
        <Image
          src={item.src}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          sizes={isThumbnail ? "100px" : enlarged ? "100vw" : "50vw"}
          onError={() => setIsError(true)}
        />
      )
    case 'video':
      return (
        <>
          <video
            ref={videoRef}
            src={item.src}
            poster={item.thumbnail}
            className="w-full h-full object-cover"
            muted={isThumbnail}
            loop
            playsInline
            onClick={handlePlayPause}
            onError={() => setIsError(true)}
          />
          {!isThumbnail && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300"
              onClick={handlePlayPause}
            >
              <Play className="text-white" size={48} />
            </div>
          )}
        </>
      )
    case 'youtube':
      return (
        <iframe
          src={`${item.src}?autoplay=0&mute=${isThumbnail ? 1 : 0}`}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onError={() => setIsError(true)}
        />
      )
    default:
      return null
  }
}

function YouTubeUploadForm({ onUpload }: { onUpload: (url: string) => void }) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpload(url)
    setUrl('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="youtube-url">YouTube URL</Label>
        <Input
          id="youtube-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
      </div>
      <Button type="submit">Add YouTube Video</Button>
    </form>
  )
}

function TagInput({ tags, onAddTag, onRemoveTag }: { tags: string[]; onAddTag: (tag: string) => void; onRemoveTag: (tag: string) => void }) {
  const [newTag, setNewTag] = useState('')

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim()) {
      onAddTag(newTag.trim())
      setNewTag('')
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tag-input">Tags</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag} className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm flex items-center">
            {tag}
            <button onClick={() => onRemoveTag(tag)} className="ml-2 text-primary-foreground hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddTag} className="flex gap-2">
        <Input
          id="tag-input"
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  )
}

function MetadataInput({ metadata, onAddMetadata }: { metadata: Record<string, string>; onAddMetadata: (key: string, value: string) => void }) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAddMetadata = (e: React.FormEvent) => {
    e.preventDefault()
    if (newKey.trim() && newValue.trim()) {
      onAddMetadata(newKey.trim(), newValue.trim())
      setNewKey('')
      setNewValue('')
    }
  }

  return (
    <div className="space-y-2">
      <Label>Metadata</Label>
      <div className="space-y-2">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-semibold">{key}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddMetadata} className="flex gap-2">
        <Input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Key"
        />
        <Input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  )
}