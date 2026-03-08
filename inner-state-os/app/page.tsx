"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setButtonVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="/Landing (1).png"
        alt="Inner State OS"
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "top" }}
      />

      {/* Background blur layer — fades in with button */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          backdropFilter: buttonVisible ? "blur(2px)" : "blur(0px)",
          background: buttonVisible ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0)",
          transition: "all 1.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Centered CTA Button — fades in */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: buttonVisible ? "auto" : "none",
          opacity: buttonVisible ? 1 : 0,
          transform: buttonVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
        }}
      >
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "18px 40px",
            borderRadius: 14,
            border: "1px solid rgba(117, 71, 255, 0.4)",
            background: "linear-gradient(135deg, #0a0a1a 0%, #1a1040 100%)",
            color: "#e8e8f0",
            fontSize: 17,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.02em",
            boxShadow: "0 0 30px rgba(117, 71, 255, 0.3), 0 4px 16px rgba(0,0,0,0.5)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 44px rgba(117, 71, 255, 0.5), 0 4px 20px rgba(0,0,0,0.6)";
            e.currentTarget.style.transform = "scale(1.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(117, 71, 255, 0.3), 0 4px 16px rgba(0,0,0,0.5)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Get the Extension
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
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
              borderRadius: 16,
              background: "#0a0a1a",
              border: "1px solid #1a1a2e",
              boxShadow: "0 0 40px rgba(117, 71, 255, 0.15)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0", margin: 0 }}>
                Install Inner State OS
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#555", fontSize: 18,
                  background: "#14141f", border: "1px solid #222",
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
                borderRadius: 10,
                background: "linear-gradient(135deg, #7547FF 0%, #5a3fd4 100%)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
                marginBottom: 28,
              }}
            >
              Download Extension (ZIP)
            </a>

            {/* Steps */}
            <div style={{ fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
              Installation Steps
            </div>

            {[
              { step: "1", text: "Download and unzip the file from the link above" },
              { step: "2", text: <>Go to <code style={{ background: "#14141f", padding: "2px 6px", borderRadius: 4, color: "#c4a8ff", fontSize: 12 }}>chrome://extensions</code> in your browser</> },
              { step: "3", text: <>Enable <strong style={{ color: "#e8e8f0" }}>Developer mode</strong> using the toggle in the top right corner</> },
              { step: "4", text: <>Click <strong style={{ color: "#e8e8f0" }}>Load unpacked</strong> and select the unzipped folder</> },
            ].map(({ step, text }) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#14141f", border: "1px solid #1a1a2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#7547FF",
                  flexShrink: 0,
                }}>
                  {step}
                </div>
                <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6, paddingTop: 3 }}>
                  {text}
                </div>
              </div>
            ))}

            <div style={{ fontSize: 12, color: "#555", marginTop: 8, lineHeight: 1.5 }}>
              Once installed, click the extension icon in your toolbar to activate the orb.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
