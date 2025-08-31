import React, { useState, useEffect, useCallback } from 'react';
import { StickyNote, Note } from './StickyNote';
import { ColorPicker } from './ColorPicker';
import { Button } from '@/components/ui/button';
import { Plus, StickyNote as StickyNoteIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'sticky-notes';

export const StickyNotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(1000);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        // Find the highest z-index to maintain layering
        const maxZ = Math.max(...parsedNotes.map((note: Note) => note.zIndex), 1000);
        setHighestZIndex(maxZ);
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const createNote = (color: 'yellow' | 'pink' | 'green' | 'blue' = 'yellow') => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      x: Math.random() * (window.innerWidth - 250) + 20,
      y: Math.random() * (window.innerHeight - 200) + 80,
      width: 250,
      height: 200,
      color,
      zIndex: highestZIndex + 1,
    };

    setNotes(prev => [...prev, newNote]);
    setHighestZIndex(prev => prev + 1);
    
    toast({
      title: "Note created!",
      description: `New ${color} sticky note added.`,
    });
  };

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({
      title: "Note deleted",
      description: "Sticky note removed.",
      variant: "destructive",
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    updateNote(id, { zIndex: newZIndex });
  }, [highestZIndex, updateNote]);

  const clearAllNotes = () => {
    setNotes([]);
    toast({
      title: "All notes cleared",
      description: "All sticky notes have been removed.",
      variant: "destructive",
    });
  };

  // Handle keyboard shortcut (Ctrl+Shift+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        createNote();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Control Panel */}
      <div className="fixed top-4 left-4 z-[9999] bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <StickyNoteIcon className="text-accent" size={20} />
          <h2 className="font-semibold text-foreground">Sticky Notes</h2>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Create new note:</p>
            <ColorPicker onColorSelect={createNote} />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => createNote()}
              className="flex-1"
            >
              <Plus size={14} className="mr-1" />
              Quick Note
            </Button>
          </div>
          
          {notes.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
                <button 
                  onClick={clearAllNotes}
                  className="text-destructive hover:underline"
                >
                  Clear all
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+N</kbd> to create
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Render all sticky notes */}
      {notes.map(note => (
        <StickyNote
          key={note.id}
          note={note}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onFocus={bringToFront}
        />
      ))}

      {/* Welcome message when no notes */}
      {notes.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 max-w-md">
            <StickyNoteIcon size={48} className="mx-auto mb-4 text-accent opacity-50" />
            <h1 className="text-2xl font-bold mb-2 text-foreground">Sticky Notes App</h1>
            <p className="text-muted-foreground mb-4">
              Create persistent sticky notes that stay on your screen. Perfect for reminders, quick thoughts, and important information.
            </p>
            <p className="text-sm text-muted-foreground">
              Click a color above to create your first note, or use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+N</kbd>
            </p>
          </div>
        </div>
      )}
    </>
  );
};