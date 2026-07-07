import React from 'react';
import {
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  MousePointerClick,
} from 'lucide-react';
import { Annotation } from '../types';

interface PropertyPanelProps {
  annotation: Annotation | null;
  onUpdate: (updates: Partial<Annotation>) => void;
}

const fontSizes = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'];

const inputCls =
  'w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition';

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </div>
  );
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ annotation, onUpdate }) => {
  if (!annotation) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mb-4">
          <MousePointerClick className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No selection</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
          Select a text annotation on the page to edit its properties.
        </p>
      </div>
    );
  }

  const seg = (active: boolean) =>
    `flex-1 inline-flex items-center justify-center py-1.5 rounded-md border transition-colors ${
      active
        ? 'border-blue-500 bg-blue-50 text-blue-600'
        : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`;

  return (
    <div className="w-72 bg-white border-l border-slate-200 overflow-y-auto">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Text Properties</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Font */}
        <div className="space-y-2">
          <SectionTitle icon={Type}>Font</SectionTitle>
          <div className="grid grid-cols-[1.7fr_1fr] gap-2">
            <select
              value={annotation.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className={inputCls}
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
            <select
              value={annotation.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className={inputCls}
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <SectionTitle icon={Palette}>Color</SectionTitle>
          <div className="space-y-2">
            <ColorRow
              label="Text"
              value={annotation.color}
              onChange={(v) => onUpdate({ color: v })}
            />
            <ColorRow
              label="Background"
              value={annotation.backgroundColor}
              onChange={(v) => onUpdate({ backgroundColor: v })}
            />
          </div>
        </div>

        {/* Horizontal alignment */}
        <div className="space-y-2">
          <SectionTitle icon={AlignLeft}>Horizontal Alignment</SectionTitle>
          <div className="flex gap-1.5">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight },
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onUpdate({ textAlign: value as 'left' | 'center' | 'right' })}
                className={seg(annotation.textAlign === value)}
                title={value}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Vertical alignment */}
        <div className="space-y-2">
          <SectionTitle icon={AlignVerticalJustifyStart}>Vertical Alignment</SectionTitle>
          <div className="flex gap-1.5">
            {[
              { value: 'top', icon: AlignVerticalJustifyStart, label: 'Top' },
              { value: 'middle', icon: AlignVerticalJustifyCenter, label: 'Middle' },
              { value: 'bottom', icon: AlignVerticalJustifyEnd, label: 'Bottom' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() =>
                  onUpdate({ verticalAlign: value as 'top' | 'middle' | 'bottom' })
                }
                className={seg(annotation.verticalAlign === value)}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Position & size */}
        <div className="space-y-2 pt-1">
          <SectionTitle icon={MousePointerClick}>Position &amp; Size</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="X" value={annotation.x} onChange={(v) => onUpdate({ x: v })} />
            <NumberField label="Y" value={annotation.y} onChange={(v) => onUpdate({ y: v })} />
            <NumberField
              label="Width"
              value={annotation.width}
              onChange={(v) => onUpdate({ width: Math.max(1, v) })}
            />
            <NumberField
              label="Height"
              value={annotation.height}
              onChange={(v) => onUpdate({ height: Math.max(1, v) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
    <div className="relative w-7 h-7 shrink-0 rounded-md border border-slate-300 overflow-hidden">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
        title={`${label} color`}
      />
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-2 py-1 text-xs font-mono border border-slate-300 rounded-md bg-white text-slate-600 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
      placeholder="#000000"
    />
  </div>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
    <input
      type="number"
      value={Math.round(value)}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full px-2 py-1.5 text-sm tabular-nums border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
    />
  </div>
);
