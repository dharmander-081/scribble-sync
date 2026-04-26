import React from 'react';
import { useGameStore } from '../store/useGameStore';

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const SIZES = [4, 8, 16, 24];

export const Toolbar: React.FC = () => {
  const activeColor = useGameStore((state) => state.activeColor);
  const activeSize = useGameStore((state) => state.activeSize);
  const activeTool = useGameStore((state) => state.activeTool);
  const setDrawingTool = useGameStore((state) => state.setDrawingTool);

  return (
    <div className="flex items-center justify-center space-x-6 bg-white rounded-full px-8 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100 mx-auto w-max mt-4">
      {/* Tools */}
      <div className="flex items-center space-x-2 border-r border-slate-200 pr-6">
        <button 
          className={`p-2 rounded-xl transition-colors ${activeTool === 'brush' ? 'bg-slate-100 text-blue-500' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setDrawingTool({ activeTool: 'brush' })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          className={`p-2 rounded-xl transition-colors ${activeTool === 'fill' ? 'bg-slate-100 text-blue-500' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setDrawingTool({ activeTool: 'fill' })}
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </button>
        <button 
          className={`p-2 rounded-xl transition-colors ${activeTool === 'eraser' ? 'bg-slate-100 text-blue-500' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setDrawingTool({ activeTool: 'eraser' })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Colors */}
      <div className="flex items-center space-x-3 border-r border-slate-200 pr-6">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setDrawingTool({ activeColor: color, activeTool: 'brush' })}
            className={`w-8 h-8 rounded-full transition-transform ${activeColor === color && activeTool === 'brush' ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Sizes */}
      <div className="flex items-center space-x-4 pl-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setDrawingTool({ activeSize: size })}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${activeSize === size ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
          >
            <div 
              className="bg-slate-800 rounded-full" 
              style={{ width: size, height: size, maxWidth: '24px', maxHeight: '24px' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
