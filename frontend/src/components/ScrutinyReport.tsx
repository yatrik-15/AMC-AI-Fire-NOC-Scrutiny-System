"use client";

import type {
  RoomEntity,
  StaircaseEntity,
  EvaluateResponse,
  OccupancyType,
} from "@/lib/types";

interface ScrutinyReportProps {
  rooms: RoomEntity[];
  staircases: StaircaseEntity[];
  staircaseWidths: number[];
  buildingHeight: number;
  occupancy: OccupancyType;
  evaluation: EvaluateResponse;
}

export default function ScrutinyReport({
  rooms,
  staircases,
  staircaseWidths,
  buildingHeight,
  occupancy,
  evaluation,
}: ScrutinyReportProps) {
  const isApproved = evaluation.decision === "APPROVED";

  // Determine minimum staircase width for this occupancy
  const minStairWidth =
    occupancy === "Commercial" || occupancy === "Institutional" ? 1.5 : 1.2;

  return (
    <div className="animate-in animate-in-delay-2">
      {/* Status Banner */}
      <div
        className={`report-status-banner ${isApproved ? "approved" : "rejected"}`}
        id="scrutiny-status"
      >
        <span className="report-status-icon">
          {isApproved ? "PASS" : "FAIL"}
        </span>
        <div>
          <div>STATUS: {evaluation.decision}</div>
          <div style={{ fontSize: "13px", fontWeight: 400, opacity: 0.8, marginTop: "4px" }}>
            {isApproved
              ? "100% Code Compliance Achieved — All NBC 2016 rules satisfied."
              : `${evaluation.deficiencies.length} critical non-compliance item(s) identified.`}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="report-section">
        <div className="report-sub-heading">Extracted Geometric Metrics</div>
        <div className="report-metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Rooms Detected</div>
            <div className="metric-value">{rooms.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Staircases Detected</div>
            <div className="metric-value">{staircases.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Building Height</div>
            <div className="metric-value">
              {buildingHeight}
              <span className="metric-unit">m</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Occupancy Type</div>
            <div className="metric-value" style={{ fontSize: "18px" }}>
              {occupancy}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Matrix */}
      <div className="report-section">
        <div className="report-sub-heading">Compliance Matrix</div>
        <table className="compliance-matrix" id="compliance-matrix">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Parameter</th>
              <th>Actual</th>
              <th>Required</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Staircase rows */}
            {staircases.map((stair, idx) => {
              const width = staircaseWidths[idx] ?? stair.width_m;
              const pass = width >= minStairWidth;
              return (
                <tr key={`stair-${stair.id}`}>
                  <td>Staircase {stair.id}</td>
                  <td>Minimum Width</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{width}m</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    ≥ {minStairWidth}m
                  </td>
                  <td className={pass ? "status-pass" : "status-fail"}>
                    {pass ? "PASS" : "FAIL"}
                  </td>
                </tr>
              );
            })}

            {/* Room rows (residential min area) */}
            {occupancy === "Residential" &&
              rooms.map((room) => {
                const pass = room.area_sqm >= 9.5;
                return (
                  <tr key={`room-${room.id}`}>
                    <td>Room {room.id}</td>
                    <td>Habitable Area</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {room.area_sqm} m²
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>≥ 9.5 m²</td>
                    <td className={pass ? "status-pass" : "status-fail"}>
                      {pass ? "PASS" : "FAIL"}
                    </td>
                  </tr>
                );
              })}

            {/* Building height > 24m check */}
            <tr>
              <td>Building</td>
              <td>Refuge Area Req. (≤24m)</td>
              <td style={{ fontFamily: "var(--font-mono)" }}>
                {buildingHeight}m
              </td>
              <td style={{ fontFamily: "var(--font-mono)" }}>≤ 24.0m</td>
              <td
                className={buildingHeight <= 24 ? "status-pass" : "status-fail"}
              >
                {buildingHeight <= 24 ? "PASS" : "FAIL"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deficiencies */}
      {evaluation.deficiencies.length > 0 && (
        <div className="report-section">
          <div className="report-sub-heading">Deficiencies</div>
          <div className="deficiency-list">
            {evaluation.deficiencies.map((def, idx) => (
              <div className="deficiency-item" key={idx}>
                <span className="deficiency-icon">—</span>
                <span>{def}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {evaluation.recommendations.length > 0 && (
        <div className="report-section">
          <div className="report-sub-heading">Recommendations</div>
          <div className="recommendation-list">
            {evaluation.recommendations.map((rec, idx) => (
              <div className="recommendation-item" key={idx}>
                <span className="recommendation-icon">—</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
