import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { socket } from '../lib/socket';
import { DrawEventPayload, Point } from '../types/game';

export const CanvasBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Game State
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const currentDrawerId = useGameStore((state) => state.currentDrawerId);
  const isDrawer = myPlayerId === currentDrawerId && currentDrawerId !== null;

  // Tool State
  const activeColor = useGameStore((state) => state.activeColor);
  const activeSize = useGameStore((state) => state.activeSize);
  const activeTool = useGameStore((state) => state.activeTool);

  // Batching Refs
  const currentStrokeId = useRef<string>('');
  const sequenceNumber = useRef<number>(0);
  const pointsBatch = useRef<Point[]>([]);
  const lastEmitTime = useRef<number>(0);

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(scale, scale);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
      }
    }
  }, []);

  // Listen to remote draw events
  useEffect(() => {
    if (!ctx) return;

    const handleRemoteDraw = (payload: DrawEventPayload) => {
      // Don't draw our own strokes from the network if we are the drawer
      if (isDrawer) return;

      const { points, color, brushSize, sequenceNumber: seq } = payload;
      if (points.length === 0) return;

      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      
      if (seq === 0) {
        // Start of a new stroke
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
      }
      
      const startIndex = seq === 0 ? 1 : 0;
      for (let i = startIndex; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.stroke();
    };

    // Prevent duplicate listeners
    const handleEndTurn = () => {
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };

    socket.on('draw_event', handleRemoteDraw);
    socket.on('end_turn', handleEndTurn);
    socket.on('room_state_sync', handleEndTurn);

    return () => {
      socket.off('draw_event', handleRemoteDraw);
      socket.off('end_turn', handleEndTurn);
      socket.off('room_state_sync', handleEndTurn);
    };
  }, [ctx, isDrawer]);

  const emitBatch = (force = false) => {
    if (pointsBatch.current.length === 0) return;
    
    const now = Date.now();
    if (force || now - lastEmitTime.current >= 30) {
      const payload: DrawEventPayload = {
        strokeId: currentStrokeId.current,
        sequenceNumber: sequenceNumber.current++,
        color: activeTool === 'eraser' ? '#FFFFFF' : activeColor,
        brushSize: activeSize,
        points: [...pointsBatch.current],
      };
      
      socket.emit('draw_event', payload);
      
      // Keep the last point so the next batch connects smoothly
      const lastPoint = pointsBatch.current[pointsBatch.current.length - 1];
      pointsBatch.current = [lastPoint];
      lastEmitTime.current = now;
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !ctx) return;
    setIsDrawing(true);
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = activeSize;
    ctx.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : activeColor;
    
    // Only call beginPath when starting a new stroke
    ctx.beginPath();
    ctx.moveTo(x, y);

    currentStrokeId.current = Math.random().toString(36).substring(2, 9);
    sequenceNumber.current = 0;
    pointsBatch.current = [{ x, y }];
    lastEmitTime.current = Date.now();
    
    // Draw dot
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawer) return;
    if (isDrawing) {
      emitBatch(true); // force flush remaining points
    }
    setIsDrawing(false);
    pointsBatch.current = [];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !isDrawer || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    
    pointsBatch.current.push({ x, y });
    emitBatch();
  };

  return (
    <div className={`relative flex-1 w-full h-full bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        className={`w-full h-full ${!isDrawer ? 'pointer-events-none' : ''}`}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
