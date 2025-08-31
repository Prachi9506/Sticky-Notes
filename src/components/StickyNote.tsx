import React, { useState, useRef, useEffect } from 'react';
import { X, Move, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: 'yellow' | 'pink' | 'green' | 'blue';
  zIndex: number;
}

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  onFocus,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colorClasses = {
    yellow: 'bg-note-yellow border-note-yellow-dark',
    pink: 'bg-note-pink border-note-pink-dark',
    green: 'bg-note-green border-note-green-dark',
    blue: 'bg-note-blue border-note-blue-dark',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === textareaRef.current) return;
    
    e.preventDefault();
    onFocus(note.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: note.width,
      height: note.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdate(note.id, {
          x: Math.max(0, Math.min(window.innerWidth - note.width, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - note.height, e.clientY - dragStart.y)),
        });
      } else if (isResizing) {
        const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y));
        onUpdate(note.id, {
          width: Math.min(400, newWidth),
          height: Math.min(300, newHeight),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, note.id, note.width, note.height, onUpdate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(note.id, { text: e.target.value });
  };

  const handleFocus = () => {
    onFocus(note.id);
  };

  return (
    <div
      ref={noteRef}
      className={cn(
        'fixed select-none transition-all duration-200 border-2 rounded-lg',
        colorClasses[note.color],
        isDragging && 'shadow-[var(--note-shadow-drag)] scale-105',
        !isDragging && 'shadow-[var(--note-shadow)] hover:shadow-[var(--note-shadow-hover)]',
        'cursor-move'
      )}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 pb-1">
        <div className="flex items-center gap-1 opacity-40 hover:opacity-70 transition-opacity">
          <Move size={12} />
          <span className="text-xs font-medium text-note-text-light">Note</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="opacity-40 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <textarea
        ref={textareaRef}
        value={note.text}
        onChange={handleTextChange}
        onFocus={handleFocus}
        placeholder="Type your note here..."
        className="w-full h-full p-3 pt-0 bg-transparent border-0 outline-none resize-none text-note-text placeholder:text-note-text-light/60 font-mono text-sm leading-relaxed"
        style={{
          height: note.height - 40,
        }}
      />

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-30 hover:opacity-60 transition-opacity"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-note-text-light rotate-45" />
      </div>
    </div>
  );
};