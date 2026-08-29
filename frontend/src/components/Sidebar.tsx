"use client";

import type { PipelineStep, OccupancyType } from "@/lib/types";

interface SidebarProps {
  currentStep: PipelineStep;
  occupancy: OccupancyType;
  buildingHeight: number;
  onOccupancyChange: (value: OccupancyType) => void;
  onHeightChange: (value: number) => void;
  isProcessing: boolean;
}

const PIPELINE_STEPS: { key: PipelineStep; label: string }[] = [
  { key: "upload", label: "Upload Blueprint" },
  { key: "analyze", label: "Analyze & Render" },
  { key: "report", label: "Scrutiny Report" },
  { key: "seal", label: "Seal & Commit" },
];

const STEP_ORDER: PipelineStep[] = ["upload", "analyze", "report", "seal"];

const OCCUPANCY_OPTIONS: OccupancyType[] = [
  "Commercial",
  "Residential",
  "Institutional",
  "Industrial",
];

/** Inline SVG fire icon for the sidebar brand */
function FireIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

export default function Sidebar({
  currentStep,
  occupancy,
  buildingHeight,
  onOccupancyChange,
  onHeightChange,
  isProcessing,
}: SidebarProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  function getStepClass(stepKey: PipelineStep): string {
    const stepIdx = STEP_ORDER.indexOf(stepKey);
    if (stepIdx < currentIdx) return "pipeline-step completed";
    if (stepIdx === currentIdx) return "pipeline-step active";
    return "pipeline-step";
  }

  function getStepIcon(stepKey: PipelineStep): string {
    const stepIdx = STEP_ORDER.indexOf(stepKey);
    if (stepIdx < currentIdx) return "✓";
    return String(stepIdx + 1);
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <FireIcon />
        </div>
        <div className="sidebar-brand-text">
          <h2>AMC FIRE NOC</h2>
          <p>AI Scrutiny System v2</p>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Pipeline</div>
        <div className="pipeline-steps">
          {PIPELINE_STEPS.map((step) => (
            <div key={step.key} className={getStepClass(step.key)}>
              <div className="pipeline-step-number">
                {getStepIcon(step.key)}
              </div>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Scrutiny Settings</div>

        <div className="sidebar-field">
          <label htmlFor="occupancy-select">Occupancy Type</label>
          <select
            id="occupancy-select"
            className="sidebar-select"
            value={occupancy}
            onChange={(e) => onOccupancyChange(e.target.value as OccupancyType)}
            disabled={isProcessing}
          >
            {OCCUPANCY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar-field">
          <label htmlFor="height-slider">Building Height</label>
          <div className="sidebar-slider-container">
            <input
              id="height-slider"
              type="range"
              min={5}
              max={100}
              step={0.5}
              value={buildingHeight}
              onChange={(e) => onHeightChange(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
            <span className="sidebar-slider-value">{buildingHeight} m</span>
          </div>
        </div>
      </div>

      {/* Mode Badge */}
      <div className="sidebar-section" style={{ marginTop: "auto" }}>
        <div
          style={{
            padding: "12px",
            background: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-secondary)",
              marginBottom: "4px",
            }}
          >
            Standard Mode
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            NBC 2016 Part 4
          </div>
        </div>
      </div>
    </aside>
  );
}
