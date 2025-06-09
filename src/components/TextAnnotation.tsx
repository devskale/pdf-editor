import React, { useState, useRef, useEffect } from 'react';
import { X, Move } from 'lucide-react';
import { Annotation } from '../types';

interface TextAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<Annotation>) => void;
  onDelete: () => void;
}

export const TextAnnotation: React.FC<TextAnnotationProps> = ({
  annotation,
  isSelected,
  onClick,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tempText, setTempText] = useState(annotation.text);
  
  // Temporary position/size state during drag/resize
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

  console.log('TextAnnotation rendered, fontSize:', annotation.fontSize);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(target.dataset.direction || null);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (!isEditing && !target.classList.contains('delete-button')) {
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - annotation.x, 
        y: e.clientY - annotation.y 
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setTempPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newPosition = { ...tempPosition };
      let newSize = { ...tempSize };
      
      switch (isResizing) {
        case 'se':
          newSize = {
            width: Math.max(50, tempSize.width + deltaX),
            height: Math.max(20, tempSize.height + deltaY)
          };
          break;
        case 'sw':
          newPosition.x = tempPosition.x + deltaX;
          newSize = {
            width: Math.max(50, tempSize.width - deltaX),
            height: Math.max(20, tempSize.height + deltaY)
          };
          break;
        case 'ne':
          newPosition.y = tempPosition.y + deltaY;
          newSize = {
            width: Math.max(50, tempSize.width + deltaX),
            height: Math.max(20, tempSize.height - deltaY)
          };
          break;
        case 'nw':
          newPosition = {
            x: tempPosition.x + deltaX,
            y: tempPosition.y + deltaY
          };
          newSize = {
            width: Math.max(50, tempSize.width - deltaX),
            height: Math.max(20, tempSize.height - deltaY)
          };
          break;
      }
      
      setTempPosition(newPosition);
      setTempSize(newSize);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Only update history on mouse release
      onUpdate({ x: tempPosition.x, y: tempPosition.y });
      setIsDragging(false);
    } else if (isResizing) {
      // Only update history on mouse release
      onUpdate({ 
        x: tempPosition.x, 
        y: tempPosition.y,
        width: tempSize.width,
        height: tempSize.height
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
  }, [isDragging, isResizing, dragStart, annotation, tempPosition, tempSize]);

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
      wordWrap: 'break-word' as const
    };
  
    switch (annotation.verticalAlign) {
      case 'top':
        return { ...baseStyles, display: 'flex', alignItems: 'flex-start' };
      case 'middle':
        return { ...baseStyles, display: 'flex', alignItems: 'center' };
      case 'bottom':
        return { ...baseStyles, display: 'flex', alignItems: 'flex-end' };
      default:
        return baseStyles;
    }
  };

  // Use temp position/size for display during drag/resize
  const displayX = isDragging || isResizing ? tempPosition.x : annotation.x;
  const displayY = isDragging || isResizing ? tempPosition.y : annotation.y;
  const displayWidth = isDragging || isResizing ? tempSize.width : annotation.width;
  const displayHeight = isDragging || isResizing ? tempSize.height : annotation.height;

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
        left: `${displayX}px`,
        top: `${displayY}px`,
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
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
            fontSize: annotation.fontSize,
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
            fontSize: annotation.fontSize,
            textAlign: annotation.textAlign // Apply horizontal alignment here
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