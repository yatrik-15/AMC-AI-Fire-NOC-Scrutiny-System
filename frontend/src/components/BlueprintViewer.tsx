"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { RoomEntity, StaircaseEntity, DeficiencyEntityId } from "@/lib/types";

interface BlueprintViewerProps {
  rooms: RoomEntity[];
  staircases: StaircaseEntity[];
  deficiencyEntityIds: DeficiencyEntityId[];
  isEvaluated: boolean;
}

interface Transform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

/** Check if an entity is flagged as non-compliant */
function isDeficient(
  type: "room" | "staircase",
  entityId: number,
  deficiencyEntityIds: DeficiencyEntityId[]
): boolean {
  return deficiencyEntityIds.some(
    (d) => d.type === type && d.id === entityId
  );
}

/** Get all vertices across all entities to compute bounding box */
function getAllVertices(rooms: RoomEntity[], staircases: StaircaseEntity[]): number[][] {
  const allVerts: number[][] = [];
  for (const r of rooms) {
    allVerts.push(...r.vertices);
  }
  for (const s of staircases) {
    allVerts.push(...s.vertices);
  }
  return allVerts;
}

export default function BlueprintViewer({
  rooms,
  staircases,
  deficiencyEntityIds,
  isEvaluated,
}: BlueprintViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Colors — professional palette
  const COLOR_ROOM = "#1D4ED8";
  const COLOR_ROOM_FILL = "rgba(29, 78, 216, 0.10)";
  const COLOR_STAIR = "#6B7280";
  const COLOR_STAIR_FILL = "rgba(107, 114, 128, 0.10)";
  const COLOR_DEFICIENT = "#DC2626";
  const COLOR_DEFICIENT_FILL = "rgba(220, 38, 38, 0.12)";
  const COLOR_GRID = "rgba(255, 255, 255, 0.04)";
  const COLOR_LABEL = "#94A3B8";

  /** Compute initial transform to fit all geometry in the viewport */
  const computeFitTransform = useCallback(
    (canvasW: number, canvasH: number): Transform => {
      const allVerts = getAllVertices(rooms, staircases);
      if (allVerts.length === 0) {
        return { offsetX: canvasW / 2, offsetY: canvasH / 2, scale: 1 };
      }

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of allVerts) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }

      const dataW = maxX - minX || 1;
      const dataH = maxY - minY || 1;
      const padding = 60;
      const scaleX = (canvasW - padding * 2) / dataW;
      const scaleY = (canvasH - padding * 2) / dataH;
      const scale = Math.min(scaleX, scaleY);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const offsetX = canvasW / 2 - centerX * scale;
      const offsetY = canvasH / 2 + centerY * scale; // Flip Y axis

      return { offsetX, offsetY, scale };
    },
    [rooms, staircases]
  );

  /** Draw everything on the canvas */
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, t: Transform) => {
      const dpr = window.devicePixelRatio || 1;

      // Clear
      ctx.clearRect(0, 0, width * dpr, height * dpr);

      // Background grid
      ctx.save();
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width * dpr; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height * dpr);
        ctx.stroke();
      }
      for (let y = 0; y < height * dpr; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width * dpr, y);
        ctx.stroke();
      }
      ctx.restore();

      // Transform to world coordinates
      ctx.save();
      ctx.scale(dpr, dpr);

      // Helper: world → screen
      const toScreen = (wx: number, wy: number): [number, number] => [
        wx * t.scale + t.offsetX,
        -wy * t.scale + t.offsetY, // Flip Y
      ];

      // Draw polygons
      const drawEntity = (
        vertices: number[][],
        strokeColor: string,
        fillColor: string,
        lineWidth: number,
        label?: string,
        isDeficientEntity?: boolean
      ) => {
        if (vertices.length < 2) return;

        ctx.beginPath();
        const [sx, sy] = toScreen(vertices[0][0], vertices[0][1]);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < vertices.length; i++) {
          const [px, py] = toScreen(vertices[i][0], vertices[i][1]);
          ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = fillColor;
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Highlight for deficient entities — thicker stroke, no glow
        if (isDeficientEntity) {
          ctx.save();
          ctx.strokeStyle = COLOR_DEFICIENT;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        // Label
        if (label) {
          // Compute centroid
          let cx = 0, cy = 0;
          for (const v of vertices) {
            cx += v[0];
            cy += v[1];
          }
          cx /= vertices.length;
          cy /= vertices.length;
          const [lx, ly] = toScreen(cx, cy);

          ctx.font = "500 11px 'Inter', sans-serif";
          ctx.fillStyle = COLOR_LABEL;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, lx, ly);
        }
      };

      // Draw rooms
      for (const room of rooms) {
        const deficient = isEvaluated && isDeficient("room", room.id, deficiencyEntityIds);
        drawEntity(
          room.vertices,
          deficient ? COLOR_DEFICIENT : COLOR_ROOM,
          deficient ? COLOR_DEFICIENT_FILL : COLOR_ROOM_FILL,
          deficient ? 2.5 : 1.5,
          `Room ${room.id}: ${room.area_sqm} m²`,
          deficient
        );
      }

      // Draw staircases
      for (const stair of staircases) {
        const deficient = isEvaluated && isDeficient("staircase", stair.id, deficiencyEntityIds);
        drawEntity(
          stair.vertices,
          deficient ? COLOR_DEFICIENT : COLOR_STAIR,
          deficient ? COLOR_DEFICIENT_FILL : COLOR_STAIR_FILL,
          deficient ? 2.5 : 1.5,
          `Stair ${stair.id}: ${stair.width_m}m`,
          deficient
        );
      }

      ctx.restore();
    },
    [rooms, staircases, deficiencyEntityIds, isEvaluated]
  );

  // Initial render and resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const fitTransform = computeFitTransform(rect.width, rect.height);
      setTransform(fitTransform);
      draw(ctx, rect.width, rect.height, fitTransform);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [computeFitTransform, draw]);

  // Redraw on transform or data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = container.getBoundingClientRect();
    draw(ctx, rect.width, rect.height, transform);
  }, [transform, draw]);

  // Pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      setTransform((prev) => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return prev;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newScale = prev.scale * zoomFactor;
      const newOffsetX = mouseX - (mouseX - prev.offsetX) * zoomFactor;
      const newOffsetY = mouseY - (mouseY - prev.offsetY) * zoomFactor;
      return { offsetX: newOffsetX, offsetY: newOffsetY, scale: newScale };
    });
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTransform(computeFitTransform(rect.width, rect.height));
  }, [computeFitTransform]);

  return (
    <div className="viewer-container animate-in animate-in-delay-1">
      <div className="viewer-toolbar">
        <div className="viewer-toolbar-title">
          2D Blueprint Viewer — Standard Mode
        </div>
        <div className="viewer-toolbar-controls">
          <button
            className="viewer-toolbar-btn"
            onClick={() =>
              setTransform((prev) => ({
                ...prev,
                scale: prev.scale * 1.2,
              }))
            }
          >
            Zoom +
          </button>
          <button
            className="viewer-toolbar-btn"
            onClick={() =>
              setTransform((prev) => ({
                ...prev,
                scale: prev.scale * 0.8,
              }))
            }
          >
            Zoom −
          </button>
          <button className="viewer-toolbar-btn" onClick={handleReset}>
            Reset View
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="viewer-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="viewer-canvas" />
      </div>

      <div className="viewer-legend">
        <div className="viewer-legend-item">
          <div
            className="viewer-legend-color"
            style={{ background: COLOR_ROOM }}
          />
          <span>Rooms</span>
        </div>
        <div className="viewer-legend-item">
          <div
            className="viewer-legend-color"
            style={{ background: COLOR_STAIR }}
          />
          <span>Staircases</span>
        </div>
        {isEvaluated && deficiencyEntityIds.length > 0 && (
          <div className="viewer-legend-item">
            <div
              className="viewer-legend-color"
              style={{ background: COLOR_DEFICIENT }}
            />
            <span>Non-Compliant</span>
          </div>
        )}
      </div>
    </div>
  );
}
