import React from 'react';
import { Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';
import { Annotation } from '../types';

interface PropertyPanelProps {
  annotation: Annotation | null;
  onUpdate: (updates: Partial<Annotation>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  annotation, 
  onUpdate 
}) => {
  if (!annotation) {
    return (
      <div className="w-64 bg-white border-l border-slate-200 p-4">
        <div className="text-center text-slate-500 mt-8">
          <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a text annotation to edit its properties</p>
        </div>
      </div>
    );
  }

  const fontSizes = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32]; // Updated to include 6px
  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'];

  return (
    <div className="w-64 bg-white border-l border-slate-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Text Properties</h3>
      
      <div className="space-y-4">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Font Family
          </label>
          <select
            value={annotation.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Font Size
          </label>
          <select
            value={annotation.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Text Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={annotation.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={annotation.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={annotation.backgroundColor}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={annotation.backgroundColor}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Horizontal Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Horizontal Alignment
          </label>
          <div className="flex space-x-1">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight }
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onUpdate({ textAlign: value as 'left' | 'center' | 'right' })}
                className={`flex-1 p-2 rounded-lg border transition-colors ${
                  annotation.textAlign === value
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Vertical Alignment
          </label>
          <div className="flex space-x-1">
            {[
              { value: 'top', icon: AlignVerticalJustifyStart, label: 'Top' },
              { value: 'middle', icon: AlignVerticalJustifyCenter, label: 'Middle' },
              { value: 'bottom', icon: AlignVerticalJustifyEnd, label: 'Bottom' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => onUpdate({ verticalAlign: value as 'top' | 'middle' | 'bottom' })}
                className={`flex-1 p-2 rounded-lg border transition-colors ${
                  annotation.verticalAlign === value
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Position and Size */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">X</label>
              <input
                type="number"
                value={Math.round(annotation.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(annotation.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(annotation.width)}
                onChange={(e) => onUpdate({ width: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(annotation.height)}
                onChange={(e) => onUpdate({ height: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};