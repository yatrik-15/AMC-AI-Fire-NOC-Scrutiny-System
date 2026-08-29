"use client";

import { useState, useCallback } from "react";
import type { SealResponse } from "@/lib/types";

interface CryptographicSealProps {
  sealData: SealResponse;
  onCommit: () => void;
}

/** Inline SVG lock icon */
function LockIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** Inline SVG shield-check icon */
function ShieldCheckIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

export default function CryptographicSeal({
  sealData,
  onCommit,
}: CryptographicSealProps) {
  const [copied, setCopied] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sealData.sha256_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = sealData.sha256_hash;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [sealData.sha256_hash]);

  const handleCommit = useCallback(() => {
    setShowConfirm(false);
    setCommitted(true);
    onCommit();
  }, [onCommit]);

  // Format timestamp for display
  const formattedTimestamp = new Date(sealData.timestamp).toLocaleString(
    "en-IN",
    {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Kolkata",
    }
  );

  return (
    <div className="animate-in animate-in-delay-3" id="cryptographic-seal">
      <div className="seal-container glass-card">
        {!committed ? (
          <>
            <div style={{ marginBottom: "var(--space-md)", color: "var(--text-muted)" }}>
              <LockIcon />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "var(--space-sm)",
              }}
            >
              Cryptographic Audit Seal
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "var(--space-md)",
              }}
            >
              SHA-256 tamper-proof fingerprint for WORM database
            </p>

            {/* Hash field */}
            <div className="seal-hash-field">
              <code className="seal-hash-value">{sealData.sha256_hash}</code>
              <button className="seal-copy-btn" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Timestamp */}
            <div className="seal-timestamp">{formattedTimestamp}</div>

            {/* Commit button / Confirmation */}
            {!showConfirm ? (
              <button
                className="seal-commit-btn"
                onClick={() => setShowConfirm(true)}
                id="commit-worm-btn"
              >
                Commit to WORM Server
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "var(--space-md)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-warning)",
                  }}
                >
                  This action is irreversible. Confirm commit?
                </p>
                <div style={{ display: "flex", gap: "var(--space-md)" }}>
                  <button
                    className="seal-commit-btn"
                    onClick={handleCommit}
                    style={{ fontSize: "14px", padding: "10px 24px" }}
                  >
                    Confirm
                  </button>
                  <button
                    className="viewer-toolbar-btn"
                    onClick={() => setShowConfirm(false)}
                    style={{ padding: "10px 24px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="seal-committed">
            <div className="seal-committed-icon" style={{ color: "var(--color-success)" }}>
              <ShieldCheckIcon />
            </div>
            <div style={{ fontSize: "18px" }}>
              Sealed & Committed to WORM Server
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Hash: {sealData.sha256_hash.slice(0, 16)}…
              {sealData.sha256_hash.slice(-8)}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {formattedTimestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
