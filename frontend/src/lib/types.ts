// ============================================================
// Shared TypeScript interfaces matching the FastAPI API schemas
// ============================================================

/** Occupancy types supported by NBC 2016 rules */
export type OccupancyType = "Commercial" | "Residential" | "Institutional" | "Industrial";

/** Compliance decision from the rule engine */
export type ComplianceDecision = "APPROVED" | "REJECTED";

/** Pipeline step identifiers */
export type PipelineStep = "upload" | "analyze" | "report" | "seal";

// ---- API Response Types ----

/** Single room entity from CAD extraction */
export interface RoomEntity {
  id: number;
  width_m: number;
  length_m: number;
  area_sqm: number;
  vertices: number[][];
}

/** Single staircase entity from CAD extraction */
export interface StaircaseEntity {
  id: number;
  width_m: number;
  length_m: number;
  vertices: number[][];
}

/** Response from POST /api/v1/extract */
export interface ExtractResponse {
  status: string;
  data: {
    rooms: RoomEntity[];
    staircases: StaircaseEntity[];
    staircase_widths_m: number[];
    building_height_m: number | null;
  };
}

/** Entity ID flagged as non-compliant */
export interface DeficiencyEntityId {
  type: "room" | "staircase";
  id: number;
  rule: string;
  actual: number;
  required: number;
}

/** Response from POST /api/v1/evaluate */
export interface EvaluateResponse {
  status: string;
  decision: ComplianceDecision;
  deficiencies: string[];
  recommendations: string[];
  deficiency_entity_ids: DeficiencyEntityId[];
}

/** Request body for POST /api/v1/evaluate */
export interface EvaluateRequest {
  rooms: RoomEntity[];
  staircases: StaircaseEntity[];
  staircase_widths_m: number[];
  building_height_m: number;
  occupancy_type: OccupancyType;
}

/** Response from POST /api/v1/seal */
export interface SealResponse {
  status: string;
  sha256_hash: string;
  timestamp: string;
}

/** Request body for POST /api/v1/seal */
export interface SealRequest {
  filename: string;
  metrics: Record<string, unknown>;
  evaluation: Record<string, unknown>;
}

/** Full pipeline state managed by the dashboard */
export interface PipelineState {
  currentStep: PipelineStep;
  file: File | null;
  filename: string;
  occupancy: OccupancyType;
  buildingHeight: number;
  extractData: ExtractResponse["data"] | null;
  evaluationResult: EvaluateResponse | null;
  sealResult: SealResponse | null;
  isProcessing: boolean;
  error: string | null;
}
