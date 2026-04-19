import { useState, useRef } from "react";

export default function DropZone({ defs, loaded, onLoad, onLoadSamples }) {
  const [drag, setDrag] = useState(null);
  const inputRefs = useRef({});

  const handleFile = (key, file) => {
    const reader = new FileReader();
    reader.onload = e => onLoad(key, new Uint8Array(e.target.result));
    reader.readAsArrayBuffer(file);
  };

  const loadedCount = defs.filter(d => loaded[d.key]).length;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, color: "#e2e8f0", marginBottom: 4 }}>
            Chargez les {defs.length} exports Revit
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {loadedCount}/{defs.length} fichiers chargés
          </div>
        </div>
        <button className="btn-sample" onClick={onLoadSamples}>
          ⚡ Charger tous les exemples
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, marginBottom: 24, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${(loadedCount / defs.length) * 100}%`,
          background: "linear-gradient(90deg, #0284c7, #16a34a)",
          transition: "width 0.4s",
          borderRadius: 4,
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {defs.map(def => {
          const isLoaded = loaded[def.key];
          return (
            <div
              key={def.key}
              style={{
                background: isLoaded ? "rgba(22,163,74,0.07)" : drag === def.key ? "rgba(2,132,199,0.08)" : "#ffffff",
                border: `1px dashed ${isLoaded ? "#16a34a55" : drag === def.key ? "#0284c7" : "#bae6fd"}`,
                borderRadius: 10,
                padding: 16,
                cursor: isLoaded ? "default" : "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => !isLoaded && inputRefs.current[def.key]?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(def.key); }}
              onDragLeave={() => setDrag(null)}
              onDrop={e => {
                e.preventDefault();
                setDrag(null);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(def.key, file);
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isLoaded ? "rgba(34,197,94,0.15)" : "rgba(56,189,248,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {isLoaded ? "✓" : "📄"}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: isLoaded ? "#16a34a" : "#0284c7", fontWeight: 500 }}>
                    {def.label}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>
                    {isLoaded ? "Chargé" : def.sample}
                  </div>
                </div>
              </div>
              <input
                ref={el => inputRefs.current[def.key] = el}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (f) handleFile(def.key, f); }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
