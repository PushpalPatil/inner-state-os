"use client";

import { useState, useEffect, useRef } from "react";

function useTypewriter(text: string, speed: number, startDelay: number) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval: NodeJS.Timeout;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [stage, setStage] = useState(0);

  const title = useTypewriter("Inner State OS", 80, 500);
  const tagline2 = useTypewriter("This one reads how you're doing.", 35, 3000);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 2200);
    const t3 = setTimeout(() => setStage(3), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#050510",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "var(--font-share-tech-mono), monospace",
    }}>
      {/* Scanline overlay */}
      <div className="scanline-overlay" />
      <div className="crt-lines" />

      {/* Ambient glow — pulsing */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(117, 71, 255, 0.1) 0%, rgba(117, 71, 255, 0.03) 40%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        animation: "subtle-drift 6s ease-in-out infinite",
      }} />

      {/* Grid lines background */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(117, 71, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(117, 71, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Title with glitch */}
      <h1
        className="glitch-title"
        data-text="Inner State OS"
        style={{
          fontSize: 56,
          fontWeight: 400,
          color: "#e8e8f0",
          margin: 0,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: stage >= 1 ? 1 : 0,
          transition: "opacity 0.3s ease",
          minHeight: 70,
        }}
      >
        {title.displayed}
        {!title.done && <span className="typing-cursor" />}
      </h1>

      {/* Version tag */}
      <div style={{
        fontSize: 13,
        color: "#7d52ff",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginTop: 8,
        opacity: title.done ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}>
        v1.0 // emotional intelligence layer
      </div>

      {/* Tagline — typed out */}
      <div style={{
        marginTop: 32,
        textAlign: "center",
        minHeight: 60,
        opacity: stage >= 2 ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>
        <p style={{
          fontSize: 17,
          color: "#9a9ab0",
          margin: 0,
          lineHeight: 1.8,
          letterSpacing: "0.04em",
        }}>
          Your work tools track tasks.
        </p>
        <p style={{
          fontSize: 17,
          color: "#c4c4d8",
          margin: "4px 0 0 0",
          lineHeight: 1.8,
          letterSpacing: "0.04em",
        }}>
          {tagline2.displayed}
          {!tagline2.done && <span className="typing-cursor" />}
        </p>
      </div>

      {/* Divider */}
      <div style={{
        width: 60,
        height: 1,
        background: "linear-gradient(90deg, transparent, #7547FF40, transparent)",
        margin: "36px 0",
        opacity: stage >= 3 ? 1 : 0,
        transition: "opacity 1s ease",
      }} />

      {/* Three pillars */}
      <div style={{
        display: "flex",
        gap: 56,
        marginBottom: 52,
        opacity: stage >= 3 ? 1 : 0,
        transform: stage >= 3 ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        {[
          { label: "01 // Listen", desc: "Captures your standup" },
          { label: "02 // Read", desc: "Analyzes emotional state" },
          { label: "03 // Align", desc: "Ranks tasks to match" },
        ].map(({ label, desc }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 12,
              fontWeight: 400,
              color: "#c4a8ff",
              marginBottom: 6,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: "#9797bd", letterSpacing: "0.04em" }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "20px 56px",
          borderRadius: 2,
          border: "1px solid rgba(117, 71, 255, 0.3)",
          background: "transparent",
          color: "#c4a8ff",
          fontSize: 16,
          fontWeight: 400,
          cursor: "pointer",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "var(--font-share-tech-mono), monospace",
          boxShadow: "0 0 20px rgba(117, 71, 255, 0.15), inset 0 0 20px rgba(117, 71, 255, 0.05)",
          transition: "all 0.3s ease",
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(10px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 40px rgba(117, 71, 255, 0.35), inset 0 0 30px rgba(117, 71, 255, 0.1)";
          e.currentTarget.style.borderColor = "rgba(117, 71, 255, 0.6)";
          e.currentTarget.style.color = "#e8e8f0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(117, 71, 255, 0.15), inset 0 0 20px rgba(117, 71, 255, 0.05)";
          e.currentTarget.style.borderColor = "rgba(117, 71, 255, 0.3)";
          e.currentTarget.style.color = "#c4a8ff";
        }}
      >
        Get the Extension
      </button>

      {/* Footer credit */}
      <div style={{
        position: "absolute",
        bottom: 24,
        fontSize: 10,
        color: "#2a2a3a",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}>
        Built with Gemini + Claude // Agent Glow Up 2026
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(5, 5, 16, 0.9)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              margin: "0 20px",
              padding: 32,
              borderRadius: 2,
              background: "#0a0a1a",
              border: "1px solid #1a1a2e",
              boxShadow: "0 0 40px rgba(117, 71, 255, 0.1)",
              fontFamily: "var(--font-share-tech-mono), monospace",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 400,
                color: "#c4a8ff",
                margin: 0,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                // Install
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#555", fontSize: 14,
                  background: "transparent", border: "1px solid #1a1a2e",
                  borderRadius: 2,
                  fontFamily: "var(--font-share-tech-mono), monospace",
                }}
              >
                ✕
              </button>
            </div>

            {/* Download Link */}
            <a
              href="https://drive.google.com/file/d/1a8NXV3B72gUsGlww4gzsxyWvyuaZbHxS/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "14px 20px",
                borderRadius: 2,
                background: "transparent",
                border: "1px solid #7547FF",
                color: "#c4a8ff",
                fontSize: 14,
                fontWeight: 400,
                textAlign: "center",
                textDecoration: "none",
                marginBottom: 28,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "var(--font-share-tech-mono), monospace",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(117, 71, 255, 0.1)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(117, 71, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Download Extension (.zip)
            </a>

            {/* Steps */}
            <div style={{
              fontSize: 11, color: "#9e9e9e",
              textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16,
            }}>
              Setup sequence
            </div>

            {[
              { step: "01", text: "Download and unzip the file above" },
              { step: "02", text: <>Navigate to <code style={{ background: "#14141f", padding: "2px 6px", borderRadius: 2, color: "#c4a8ff", fontSize: 12 }}>chrome://extensions</code></> },
              { step: "03", text: <>Enable <span style={{ color: "#c4a8ff" }}>Developer mode</span> — top right toggle</> },
              { step: "04", text: <>Click <span style={{ color: "#c4a8ff" }}>Load unpacked</span> — select the folder</> },
            ].map(({ step, text }) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div style={{
                  fontSize: 11,
                  color: "#7547FF",
                  letterSpacing: "0.1em",
                  flexShrink: 0,
                  paddingTop: 2,
                  fontFamily: "var(--font-share-tech-mono), monospace",
                }}>
                  {step}
                </div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                  {text}
                </div>
              </div>
            ))}

            <div style={{
              fontSize: 11, color: "#9e9e9e", marginTop: 12, lineHeight: 1.5,
              borderTop: "1px solid #1a1a2e", paddingTop: 12,
            }}>
              Click the extension icon in your toolbar to activate the orb.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
