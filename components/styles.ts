import type React from "react";
import { P } from "./canvas/palette";

// ─── Overlay / Modal ──────────────────────────────────────────────────────────

export const overlayS: React.CSSProperties = {
  position:       "absolute",
  inset:          0,
  background:     "rgba(0,0,0,0.74)",
  backdropFilter: "blur(4px)",
  display:        "flex",
  justifyContent: "center",
  alignItems:     "center",
  zIndex:         100,
};

export const modalS: React.CSSProperties = {
  background:   "#111",
  padding:      "1.7rem",
  borderRadius: 8,
  border:       `1px solid ${P.border}`,
  boxShadow:    "0 20px 60px rgba(0,0,0,0.95)",
  width:        "90%",
};

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const ghostS: React.CSSProperties = {
  padding:     "7px 18px",
  background:  "transparent",
  color:       P.muted,
  border:      `1px solid ${P.border}`,
  borderRadius: 4,
  cursor:      "pointer",
  fontFamily:  "'Courier New', monospace",
  fontSize:    12,
};

export const topBtnS: React.CSSProperties = {
  display:        "flex",
  alignItems:     "center",
  gap:            5,
  padding:        "7px 11px",
  background:     "rgba(8,8,8,0.88)",
  backdropFilter: "blur(12px)",
  border:         `1px solid ${P.border}`,
  borderRadius:   6,
  color:          P.muted,
  cursor:         "pointer",
  fontSize:       11,
  fontFamily:     "'Courier New', monospace",
};

export const dropS: React.CSSProperties = {
  display:    "flex",
  alignItems: "center",
  gap:        8,
  width:      "100%",
  padding:    "9px 13px",
  background: "transparent",
  border:     "none",
  color:      P.text,
  cursor:     "pointer",
  fontSize:   12,
  fontFamily: "'Courier New', monospace",
  textAlign:  "left",
  transition: "background 0.1s",
};

// ─── Toolbar divider ──────────────────────────────────────────────────────────

export const dividerS: React.CSSProperties = {
  width:      1,
  height:     20,
  background: P.border,
  margin:     "0 2px",
};

// ─── Panel / table ────────────────────────────────────────────────────────────

export const emptyTxt: React.CSSProperties = {
  color:      P.muted,
  textAlign:  "center",
  marginTop:  "2.5rem",
  fontSize:   12,
};