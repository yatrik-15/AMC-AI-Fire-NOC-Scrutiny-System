// ============================================================
// Typed API client for the FastAPI backend
// ============================================================

import type {
  ExtractResponse,
  EvaluateRequest,
  EvaluateResponse,
  SealRequest,
  SealResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * POST /api/v1/extract
 * Uploads a DXF file and extracts geometric measurements + vertex data.
 */
export async function extractFile(
  file: File,
  mode: string = "standard"
): Promise<ExtractResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  const res = await fetch(`${API_BASE}/api/v1/extract`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(err.detail || `Extraction failed (${res.status})`);
  }

  return res.json();
}

/**
 * POST /api/v1/evaluate
 * Runs extracted metrics against the NBC 2016 rule engine.
 */
export async function evaluateMetrics(
  request: EvaluateRequest
): Promise<EvaluateResponse> {
  const res = await fetch(`${API_BASE}/api/v1/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Evaluation failed" }));
    throw new Error(err.detail || `Evaluation failed (${res.status})`);
  }

  return res.json();
}

/**
 * POST /api/v1/seal
 * Generates a SHA-256 WORM cryptographic seal.
 */
export async function sealReport(
  request: SealRequest
): Promise<SealResponse> {
  const res = await fetch(`${API_BASE}/api/v1/seal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Seal generation failed" }));
    throw new Error(err.detail || `Seal failed (${res.status})`);
  }

  return res.json();
}
