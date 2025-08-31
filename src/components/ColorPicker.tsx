import React from 'react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  onColorSelect: (color: 'yellow' | 'pink' | 'green' | 'blue') => void;
}

const colors = [
  { name: 'yellow', label: 'Yellow', class: 'bg-note-yellow border-note-yellow-dark' },
  { name: 'pink', label: 'Pink', class: 'bg-note-pink border-note-pink-dark' },
  { name: 'green', label: 'Green', class: 'bg-note-green border-note-green-dark' },
  { name: 'blue', label: 'Blue', class: 'bg-note-blue border-note-blue-dark' },
] as const;

export const ColorPicker: React.FC<ColorPickerProps> = ({ onColorSelect }) => {
  return (
    <div className="flex gap-2">
      {colors.map(color => (
        <button
          key={color.name}
          onClick={() => onColorSelect(color.name)}
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all duration-200',
            'hover:scale-110 hover:shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            color.class
          )}
          title={`Create ${color.label} note`}
          aria-label={`Create ${color.label} sticky note`}
        />
      ))}
    </div>
  );

};

