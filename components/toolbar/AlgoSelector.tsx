"use client";
import { useState } from "react";
import { ALGO_FAMILIES, type AlgoFamily, type AlgoVariant } from "@/algorithms/registry";
import { P } from "@/components/canvas/palette";

interface Props {
  currentMode: string;
  onSelect:    (mode: string) => void;
  onClose:     () => void;
}

export default function AlgoSelector({ currentMode, onSelect, onClose }: Props) {
  const [step,          setStep]          = useState<"family" | "variant">("family");
  const [activeFamily,  setActiveFamily]  = useState<AlgoFamily | null>(null);
  const [hoveredFamily, setHoveredFamily] = useState<string | null>(null);

  const handleFamilyClick = (family: AlgoFamily) => {
  if (family.coming) return;

  // ← agregar este bloque
  if (family.href) {
    window.location.href = family.href;   // o usa router.push si tienes useRouter
    onClose();
    return;
  }

  if (family.directMode !== undefined) {
    onSelect(family.directMode);
    onClose();
    return;
  }
  if (family.variants && family.variants.length > 0) {
    setActiveFamily(family);
    setStep("variant");
  }
};

  const handleVariantClick = (variant: AlgoVariant) => {
    onSelect(variant.id);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   "#0d0d0d",
          border:       `1px solid ${P.border}`,
          borderRadius: 14,
          boxShadow:    "0 32px 80px rgba(0,0,0,0.95)",
          width:        step === "family" ? 580 : 420,
          maxWidth:     "92vw",
          overflow:     "hidden",
          transition:   "width 0.2s ease",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          padding:      "18px 22px 14px",
          borderBottom: `1px solid ${P.border}`,
          display:      "flex",
          alignItems:   "center",
          gap:          10,
        }}>
          {step === "variant" && (
            <button
              onClick={() => { setStep("family"); setActiveFamily(null); }}
              style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 5, color: P.muted, cursor: "pointer", padding: "3px 8px", fontSize: 13, fontFamily: "inherit" }}
            >
              ←
            </button>
          )}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 2 }}>
              {step === "family" ? "MODO DE TRABAJO" : `${activeFamily?.label?.toUpperCase()} — VARIANTE`}
            </div>
            <div style={{ color: P.text, fontSize: "0.95rem", fontFamily: "'Courier New', monospace" }}>
              {step === "family" ? "Selecciona un algoritmo" : "¿Minimizar o maximizar?"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 18 }}
          >
            ✕
          </button>
        </div>

        {/* ── Step 1: Family grid ──────────────────────────────────────────── */}
        {step === "family" && (
          <div style={{ padding: "18px 22px 22px" }}>
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap:                 10,
            }}>
              {ALGO_FAMILIES.map((family) => {
                const isActive  = family.directMode === currentMode ||
                                  family.variants?.some((v) => v.id === currentMode);
                const isHovered = hoveredFamily === family.id;
                const isComing  = !!family.coming;

                return (
                  <button
                    key={family.id}
                    onClick={() => handleFamilyClick(family)}
                    onMouseEnter={() => !isComing && setHoveredFamily(family.id)}
                    onMouseLeave={() => setHoveredFamily(null)}
                    disabled={isComing}
                    style={{
                      position:     "relative",
                      padding:      "14px 16px",
                      background:   isActive  ? family.colorDim :
                                    isHovered ? `${family.color}0d` : "#111",
                      border:       `1px solid ${isActive ? family.color : isHovered ? `${family.color}55` : P.border}`,
                      borderRadius: 9,
                      cursor:       isComing ? "not-allowed" : "pointer",
                      textAlign:    "left",
                      transition:   "all 0.14s",
                      opacity:      isComing ? 0.45 : 1,
                      fontFamily:   "'Courier New', monospace",
                    }}
                  >
                    {/* Coming soon badge */}
                    {isComing && (
                      <span style={{
                        position:     "absolute", top: 8, right: 10,
                        fontSize:     8, letterSpacing: 1,
                        color:        P.muted, background: "#1a1a1a",
                        border:       `1px solid ${P.border}`,
                        borderRadius: 3, padding:  "2px 5px",
                      }}>
                        PRÓX.
                      </span>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                      <span style={{
                        fontSize:     22,
                        color:        isComing ? P.muted : isActive || isHovered ? family.color : P.muted,
                        transition:   "color 0.14s",
                      }}>
                        {family.icon}
                      </span>
                      <span style={{
                        fontSize:   12,
                        fontWeight: "bold",
                        color:      isComing ? P.muted : isActive || isHovered ? family.color : P.text,
                        transition: "color 0.14s",
                      }}>
                        {family.label}
                      </span>
                      {family.variants && !isComing && (
                        <span style={{ marginLeft: "auto", color: P.muted, fontSize: 11 }}>›</span>
                      )}
                    </div>

                    <div style={{ fontSize: 10, color: P.muted, lineHeight: 1.55 }}>
                      {family.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Variant picker ───────────────────────────────────────── */}
        {step === "variant" && activeFamily && (
          <div style={{ padding: "18px 22px 22px" }}>
            {/* Family recap */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              padding:      "10px 14px",
              background:   activeFamily.colorDim,
              border:       `1px solid ${activeFamily.color}44`,
              borderRadius: 7,
              marginBottom: 14,
              fontFamily:   "'Courier New', monospace",
            }}>
              <span style={{ fontSize: 18, color: activeFamily.color }}>{activeFamily.icon}</span>
              <div>
                <div style={{ color: activeFamily.color, fontSize: 12, fontWeight: "bold" }}>{activeFamily.label}</div>
                <div style={{ color: P.muted, fontSize: 10 }}>{activeFamily.description}</div>
              </div>
            </div>

            {/* Variants */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {activeFamily.variants?.map((variant) => {
                const isActive = variant.id === currentMode;
                return (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantClick(variant)}
                    style={{
                      padding:      "14px 16px",
                      background:   isActive ? variant.colorDim : "#111",
                      border:       `1px solid ${isActive ? variant.color : P.border}`,
                      borderRadius: 8,
                      cursor:       "pointer",
                      textAlign:    "left",
                      transition:   "all 0.14s",
                      fontFamily:   "'Courier New', monospace",
                      display:      "flex",
                      alignItems:   "center",
                      gap:          14,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = variant.colorDim;
                      e.currentTarget.style.borderColor = variant.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isActive ? variant.colorDim : "#111";
                      e.currentTarget.style.borderColor = isActive ? variant.color : P.border;
                    }}
                  >
                    <span style={{ fontSize: 24, color: variant.color }}>{variant.icon}</span>
                    <div>
                      <div style={{ color: P.white, fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>
                        {variant.label}
                      </div>
                      <div style={{ color: P.muted, fontSize: 11, lineHeight: 1.55 }}>
                        {variant.description}
                      </div>
                    </div>
                    {isActive && (
                      <span style={{ marginLeft: "auto", color: variant.color, fontSize: 10, letterSpacing: 1 }}>
                        ACTIVO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}