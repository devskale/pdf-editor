import React, { useState, useRef, useEffect } from 'react';
import { X, Move } from 'lucide-react';
import { Annotation } from '../types';

interface TextAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  scale: number; // Add scale prop
  onClick: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<Annotation>) => void;
  onDelete: () => void;
}

const ALLOWED_FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

export const TextAnnotation: React.FC<TextAnnotationProps> = ({
  annotation,
  isSelected,
  scale, // Destructure scale from props
  onClick,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  // dragStart now stores screen-based offset or initial click position
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tempText, setTempText] = useState(annotation.text);

  const validatedFontSize = ALLOWED_FONT_SIZES.includes(annotation.fontSize)
    ? annotation.fontSize
    : ALLOWED_FONT_SIZES.find(size => size === 14) || ALLOWED_FONT_SIZES[0]; 

  // tempPosition and tempSize store UN SCALED values
  const [tempPosition, setTempPosition] = useState({ x: annotation.x, y: annotation.y });
  const [tempSize, setTempSize] = useState({ width: annotation.width, height: annotation.height });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const annotationRef = useRef<HTMLDivElement>(null);

  // Update temp states when annotation changes (from external updates)
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setTempPosition({ x: annotation.x, y: annotation.y });
      setTempSize({ width: annotation.width, height: annotation.height });
    }
  }, [annotation.x, annotation.y, annotation.width, annotation.height, isDragging, isResizing]);

  useEffect(() => {
    setTempText(annotation.text);
  }, [annotation.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempText(e.target.value);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    onUpdate({ text: tempText });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    } else if (e.key === 'Escape') {
      setTempText(annotation.text);
      setIsEditing(false);
    }
  };

  console.log('TextAnnotation rendered, input fontSize:', annotation.fontSize, 'validated fontSize:', validatedFontSize, 'scale:', scale);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(target.dataset.direction || null);
      // Store initial screen click for resize delta calculation
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (!isEditing && !target.classList.contains('delete-button')) {
      setIsDragging(true);
      // Calculate offset from the scaled top-left of the annotation
      setDragStart({ 
        x: e.clientX - tempPosition.x * scale, 
        y: e.clientY - tempPosition.y * scale 
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // New position in screen coordinates, convert to unscaled
      const newX = (e.clientX - dragStart.x) / scale;
      const newY = (e.clientY - dragStart.y) / scale;
      setTempPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    } else if (isResizing) {
      // Deltas in screen coordinates
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Convert screen deltas to unscaled deltas
      const unscaledDeltaX = deltaX / scale;
      const unscaledDeltaY = deltaY / scale;
      
      let newPosition = { ...tempPosition }; // unscaled
      let newSize = { ...tempSize }; // unscaled
      
      // Min dimensions (assuming these are unscaled PDF points)
      const minWidth = 50;
      const minHeight = 20;

      switch (isResizing) {
        case 'se':
          newSize = {
            width: Math.max(minWidth, tempSize.width + unscaledDeltaX),
            height: Math.max(minHeight, tempSize.height + unscaledDeltaY)
          };
          break;
        case 'sw':
          newPosition.x = tempPosition.x + unscaledDeltaX;
          newSize = {
            width: Math.max(minWidth, tempSize.width - unscaledDeltaX),
            height: Math.max(minHeight, tempSize.height + unscaledDeltaY)
          };
          // Adjust x if width became minWidth due to dragging left
          if (newSize.width === minWidth && tempSize.width - unscaledDeltaX < minWidth) {
            newPosition.x = tempPosition.x + (tempSize.width - minWidth);
          }
          break;
        case 'ne':
          newPosition.y = tempPosition.y + unscaledDeltaY;
          newSize = {
            width: Math.max(minWidth, tempSize.width + unscaledDeltaX),
            height: Math.max(minHeight, tempSize.height - unscaledDeltaY)
          };
          // Adjust y if height became minHeight
          if (newSize.height === minHeight && tempSize.height - unscaledDeltaY < minHeight) {
            newPosition.y = tempPosition.y + (tempSize.height - minHeight);
          }
          break;
        case 'nw':
          newPosition = {
            x: tempPosition.x + unscaledDeltaX,
            y: tempPosition.y + unscaledDeltaY
          };
          newSize = {
            width: Math.max(minWidth, tempSize.width - unscaledDeltaX),
            height: Math.max(minHeight, tempSize.height - unscaledDeltaY)
          };
          // Adjust x and y if size hit minimum
          if (newSize.width === minWidth && tempSize.width - unscaledDeltaX < minWidth) {
            newPosition.x = tempPosition.x + (tempSize.width - minWidth);
          }
          if (newSize.height === minHeight && tempSize.height - unscaledDeltaY < minHeight) {
            newPosition.y = tempPosition.y + (tempSize.height - minHeight);
          }
          break;
      }
      
      setTempPosition(newPosition);
      setTempSize(newSize);
      // Update dragStart for continuous resizing based on the new screen position
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onUpdate({ x: tempPosition.x, y: tempPosition.y }); // tempPosition is unscaled
      setIsDragging(false);
    } else if (isResizing) {
      onUpdate({ 
        x: tempPosition.x, // unscaled
        y: tempPosition.y, // unscaled
        width: tempSize.width, // unscaled
        height: tempSize.height // unscaled
      });
      setIsResizing(null);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, scale, tempPosition, tempSize, onUpdate]); // Added scale, tempPosition, tempSize, onUpdate

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this text annotation?')) {
      onDelete();
    }
  };

  // Calculate display styles for vertical alignment
  const getDisplayStyles = () => {
    const baseStyles = {
      fontFamily: annotation.fontFamily,
      color: annotation.color,
      whiteSpace: 'pre-wrap' as const,
      wordWrap: 'break-word' as const,
      textAlign: annotation.textAlign, // Move textAlign to baseStyles
    };

    switch (annotation.verticalAlign) {
      case 'top':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column' as const,
          justifyContent: 'flex-start'
        };
      case 'middle':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column' as const,
          justifyContent: 'center'
        };
      case 'bottom':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column' as const,
          justifyContent: 'flex-end'
        };
      default:
        return baseStyles;
    }
  };

  // displayX, displayY, etc., are unscaled values from annotation or temp states
  const displayX = isDragging || isResizing ? tempPosition.x : annotation.x;
  const displayY = isDragging || isResizing ? tempPosition.y : annotation.y;
  const displayWidth = isDragging || isResizing ? tempSize.width : annotation.width;
  const displayHeight = isDragging || isResizing ? tempSize.height : annotation.height;

  const displayFontSize = validatedFontSize * scale;

  return (
    <div
      ref={annotationRef}
      className={`absolute border-2 ${
        isDragging || isResizing
          ? ''
          : 'transition-all duration-200'
      } ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-transparent hover:border-blue-300'
      }`}
      style={{
        // Apply scale for display
        left: `${displayX * scale}px`,
        top: `${displayY * scale}px`,
        width: `${displayWidth * scale}px`,
        height: `${displayHeight * scale}px`,
        backgroundColor: annotation.backgroundColor,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={tempText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          className="w-full h-full p-2 border-none outline-none resize-none bg-transparent"
          style={{
            fontSize: displayFontSize, // Use scaled font size for display
            fontFamily: annotation.fontFamily,
            color: annotation.color,
            textAlign: annotation.textAlign
          }}
        />
      ) : (
        <div
          className="w-full h-full p-2 overflow-hidden"
          style={{
            ...getDisplayStyles(),
            fontSize: displayFontSize, // Use scaled font size for display
          }}
        >
          {annotation.text}
        </div>
      )}

      {isSelected && !isEditing && (
        <>
          {/* Delete button */}
          <button
            className="delete-button absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" />
          </button>

          {/* Move handle */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-move">
            <Move className="w-3 h-3" />
          </div>

          {/* Resize handles */}
          <div
            className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize"
            data-direction="se"
          />
          <div
            className="resize-handle absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize"
            data-direction="sw"
          />
          <div
            className="resize-handle absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize"
            data-direction="ne"
            style={{ marginRight: '24px' }}
          />
          <div
            className="resize-handle absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize"
            data-direction="nw"
            style={{ marginLeft: '24px' }}
          />
        </>
      )}
    </div>
  );
};