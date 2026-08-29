"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import UploadGateway from "@/components/UploadGateway";
import BlueprintViewer from "@/components/BlueprintViewer";
import ScrutinyReport from "@/components/ScrutinyReport";
import CryptographicSeal from "@/components/CryptographicSeal";
import { extractFile, evaluateMetrics, sealReport } from "@/lib/api";
import type {
  PipelineState,
  OccupancyType,
  PipelineStep,
  ExtractResponse,
  EvaluateResponse,
  SealResponse,
} from "@/lib/types";

const INITIAL_STATE: PipelineState = {
  currentStep: "upload",
  file: null,
  filename: "",
  occupancy: "Commercial",
  buildingHeight: 18,
  extractData: null,
  evaluationResult: null,
  sealResult: null,
  isProcessing: false,
  error: null,
};

/** Inline SVG alert-triangle icon */
function AlertIcon() {
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
      style={{ flexShrink: 0 }}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function Dashboard() {
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- Step 1: Handle file upload and extraction ---
  const handleFileSelected = useCallback(
    async (file: File) => {
      setState((prev) => ({
        ...prev,
        file,
        filename: file.name,
        isProcessing: true,
        error: null,
        currentStep: "upload" as PipelineStep,
        // Reset downstream state
        extractData: null,
        evaluationResult: null,
        sealResult: null,
      }));

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      try {
        const extractResult: ExtractResponse = await extractFile(file, "standard");
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Small delay so user sees 100%
        await new Promise((r) => setTimeout(r, 500));

        setState((prev) => ({
          ...prev,
          extractData: extractResult.data,
          currentStep: "analyze",
          isProcessing: false,
        }));

        // --- Step 2: Automatically evaluate ---
        setState((prev) => ({ ...prev, isProcessing: true }));

        const evalResult: EvaluateResponse = await evaluateMetrics({
          rooms: extractResult.data.rooms,
          staircases: extractResult.data.staircases,
          staircase_widths_m: extractResult.data.staircase_widths_m,
          building_height_m: state.buildingHeight,
          occupancy_type: state.occupancy,
        });

        setState((prev) => ({
          ...prev,
          evaluationResult: evalResult,
          currentStep: "report",
          isProcessing: false,
        }));

        // --- Step 3: Automatically generate seal ---
        const sealResult: SealResponse = await sealReport({
          filename: file.name,
          metrics: extractResult.data as unknown as Record<string, unknown>,
          evaluation: evalResult as unknown as Record<string, unknown>,
        });

        setState((prev) => ({
          ...prev,
          sealResult: sealResult,
          currentStep: "seal",
        }));
      } catch (err) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred",
        }));
      }
    },
    [state.buildingHeight, state.occupancy]
  );

  // --- WORM commit handler (mocked) ---
  const handleCommit = useCallback(() => {
    console.log("WORM Commit:", {
      hash: state.sealResult?.sha256_hash,
      timestamp: state.sealResult?.timestamp,
    });
  }, [state.sealResult]);

  return (
    <div className="app-layout">
      <Sidebar
        currentStep={state.currentStep}
        occupancy={state.occupancy}
        buildingHeight={state.buildingHeight}
        onOccupancyChange={(val: OccupancyType) =>
          setState((prev) => ({ ...prev, occupancy: val }))
        }
        onHeightChange={(val: number) =>
          setState((prev) => ({ ...prev, buildingHeight: val }))
        }
        isProcessing={state.isProcessing}
      />

      <main className="main-content">
        {/* Page Header */}
        <div className="section-header mb-xl">
          <h1>AI Fire NOC Scrutiny</h1>
          <p>
            Deterministic blueprint validation against NBC 2016 Part 4 &amp;
            Gujarat Fire Act 2013
          </p>
        </div>

        {/* Error display */}
        {state.error && (
          <div
            className="glass-card mb-lg"
            style={{
              borderColor: "var(--color-error)",
              borderLeftWidth: "4px",
              background: "var(--color-error-dim)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-md)" }}>
              <AlertIcon />
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--color-error)",
                    marginBottom: "4px",
                  }}
                >
                  Processing Error
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {state.error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        <div className="mb-2xl">
          <div className="section-header mb-lg">
            <h2>1. Upload Structural Blueprint</h2>
            <p>
              Drag and drop a .dxf CAD file to begin the automated scrutiny
              pipeline.
            </p>
          </div>
          <UploadGateway
            onFileSelected={handleFileSelected}
            isProcessing={state.isProcessing && !state.extractData}
            uploadProgress={uploadProgress}
            uploadedFile={state.file}
          />
        </div>

        {/* Step 2: Blueprint Viewer */}
        {state.extractData && (
          <div className="mb-2xl">
            <div className="section-header mb-lg">
              <h2>2. Blueprint Analysis</h2>
              <p>
                Interactive 2D render of extracted geometry. Non-compliant
                entities are highlighted in red after evaluation.
              </p>
            </div>
            <BlueprintViewer
              rooms={state.extractData.rooms}
              staircases={state.extractData.staircases}
              deficiencyEntityIds={
                state.evaluationResult?.deficiency_entity_ids ?? []
              }
              isEvaluated={!!state.evaluationResult}
            />
          </div>
        )}

        {/* Step 3: Scrutiny Report */}
        {state.evaluationResult && state.extractData && (
          <div className="mb-2xl">
            <div className="section-header mb-lg">
              <h2>3. Compliance Scrutiny Report</h2>
              <p>
                Deterministic pass/fail assessment against NBC 2016 Part 4
                building codes.
              </p>
            </div>
            <ScrutinyReport
              rooms={state.extractData.rooms}
              staircases={state.extractData.staircases}
              staircaseWidths={state.extractData.staircase_widths_m}
              buildingHeight={state.buildingHeight}
              occupancy={state.occupancy}
              evaluation={state.evaluationResult}
            />
          </div>
        )}

        {/* Step 4: Cryptographic Seal */}
        {state.sealResult && (
          <div className="mb-2xl">
            <div className="section-header mb-lg">
              <h2>4. Cryptographic Audit Trail</h2>
              <p>
                Tamper-proof SHA-256 seal for the WORM audit database.
              </p>
            </div>
            <CryptographicSeal
              sealData={state.sealResult}
              onCommit={handleCommit}
            />
          </div>
        )}
      </main>
    </div>
  );
}
