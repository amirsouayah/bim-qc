import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, ResponsiveContainer } from "recharts";

const C = {
  blue: "#0284c7", green: "#16a34a", red: "#dc2626",
  orange: "#ea580c", yellow: "#ca8a04", purple: "#7c3aed",
  muted: "#94a3b8", dim: "#475569",
};

function KpiCard({ label, value, color = C.blue, sub }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: color, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

// ── NIVEAUX CHART (réutilisable) ──────────────────────────────────────────────
function NiveauxChart({ parNiveau }) {
  const niveauxGroupes = useMemo(() => {
    const groupKeys = ["RDC", "R+1", "R+2", "R+3", "R+4", "R+5", "R+6", "R+7", "R+8", "R+9"];
    const result = [];
    const used = new Set();
    groupKeys.forEach(key => {
      const matches = parNiveau.filter(n => n.niveau.toUpperCase().includes(key));
      if (matches.length > 0) {
        const total = matches.reduce((s, n) => s + n.count, 0);
        result.push({ niveau: key, count: total });
        matches.forEach(n => used.add(n.niveau));
      }
    });
    parNiveau.forEach(n => { if (!used.has(n.niveau)) result.push(n); });
    return result;
  }, [parNiveau]);

  const total = niveauxGroupes.reduce((s, n) => s + n.count, 0);
  const max = Math.max(...niveauxGroupes.map(x => x.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {niveauxGroupes.map(n => {
        const pct = (n.count / max) * 100;
        return (
          <div key={n.niveau} style={{ display: "grid", gridTemplateColumns: "60px 1fr 30px", gap: 8, alignItems: "center" }}>
            <span style={{ color: C.blue, fontSize: 11 }}>{n.niveau}</span>
            <div style={{ background: "#e2e8f0", borderRadius: 4, height: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #0284c7, #16a34a)", borderRadius: 4 }} />
            </div>
            <span style={{ color: C.dim, fontSize: 12, textAlign: "right", fontWeight: 600 }}>{n.count}</span>
          </div>
        );
      })}
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 30px", gap: 8, alignItems: "center", marginTop: 6, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <span style={{ color: C.dim, fontSize: 11, fontWeight: 700 }}>Total</span>
        <div />
        <span style={{ color: C.blue, fontSize: 13, textAlign: "right", fontWeight: 700 }}>{total}</span>
      </div>
    </div>
  );
}

// ── PARKING TABLE (réutilisable) ───────────────────────────────────────────────
function ParkingTable({ parking }) {
  const voiture = parking.filter(p => !p.type.toLowerCase().includes("vélo"));
  const totalV = voiture.reduce((s, p) => s + p.count, 0);

  return (
    <div className="card">
      <SectionTitle>🚗 Places de parking — {totalV} total</SectionTitle>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            {["Type", "Nb", "Niveau"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "6px 0", color: C.muted, fontSize: 10, letterSpacing: 1 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {voiture.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: "6px 0", color: C.dim, fontSize: 12 }}>{p.type}</td>
              <td style={{ padding: "6px 0", color: C.orange, fontWeight: 700 }}>{p.count}</td>
              <td style={{ padding: "6px 0", color: C.muted, fontSize: 11 }}>{p.niveau}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CAGES FINANCEMENT (réutilisable) ──────────────────────────────────────────
function CagesFinancement({ cages }) {
  const [filter, setFilter] = useState("ALL");
  const financements = [...new Set(cages.map(c => c.financement))];
  const filtered = filter === "ALL" ? cages : cages.filter(c => c.financement === filter);

  const colorMap = {
    BRS: { bg: "rgba(2,132,199,0.12)", color: C.blue },
    LLI: { bg: "rgba(22,163,74,0.12)", color: C.green },
  };
  const getStyle = f => colorMap[f] || { bg: "rgba(124,58,237,0.12)", color: C.purple };

  return (
    <div className="card">
      <SectionTitle>Nombre de cage par financement</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("ALL")}
          style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${filter === "ALL" ? C.blue : "var(--border)"}`, background: filter === "ALL" ? "rgba(2,132,199,0.1)" : "transparent", color: filter === "ALL" ? C.blue : C.muted, fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)" }}
        >Tous</button>
        {financements.map(f => {
          const s = getStyle(f);
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${active ? s.color : "var(--border)"}`, background: active ? s.bg : "transparent", color: active ? s.color : C.muted, fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)" }}
            >{f}</button>
          );
        })}
      </div>
      <table style={{ width: "100%", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", color: C.muted, fontSize: 10, letterSpacing: 1, paddingBottom: 8 }}>PROGRAMME</th>
            <th style={{ textAlign: "left", color: C.muted, fontSize: 10, letterSpacing: 1, paddingBottom: 8 }}>CAGE</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => {
            const s = getStyle(c.financement);
            return (
              <tr key={i}>
                <td style={{ padding: "5px 0" }}>
                  <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{c.financement}</span>
                </td>
                <td style={{ color: C.dim, padding: "5px 0", paddingLeft: 12 }}>{c.cage}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── TAB: DONNÉES PROGRAMME ────────────────────────────────────────────────────
function TabProgramme({ data }) {
  const { logements, parking, parNiveau, cages, programme, nbreLgtCage, shabTypo } = data;

  const totalLgt = useMemo(() => logements.reduce((s, l) => s + l.count, 0), [logements]);
  const totalParking = useMemo(() => parking.filter(p => !p.type.toLowerCase().includes("vélo")).reduce((s, p) => s + p.count, 0), [parking]);

  const pieData = useMemo(() => logements.map((l, i) => ({
    name: l.typo, value: l.count,
    fill: [C.blue, C.green, C.orange, C.purple, C.yellow][i % 5]
  })), [logements]);

  return (
    <div style={{ padding: "24px" }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
        <KpiCard label="Construction de :" value={totalLgt} color={C.blue} />
        <KpiCard label="Places de parking" value={totalParking} color={C.orange} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Nombre de logement par typologie — PieChart */}
        <div className="card">
          <SectionTitle>Nombre de logement par typologie</SectionTitle>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "monospace", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.fill }} />
                  <span style={{ color: C.muted, fontSize: 12, flex: 1 }}>{d.name}</span>
                  <span style={{ color: d.fill, fontWeight: 700 }}>{d.value}</span>
                  <span style={{ color: C.dim, fontSize: 10 }}>{Math.round(d.value / totalLgt * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logements par Niveau */}
        <div className="card">
          <SectionTitle>Logements par Niveau</SectionTitle>
          <NiveauxChart parNiveau={parNiveau} />
        </div>

        {/* Nombre de cage par financement */}
        <CagesFinancement cages={cages} />
      </div>

      {/* ── Nouveaux tableaux ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>

        {/* CDC Programme complet */}
        {programme && programme.length > 0 && (() => {
          const totalShab = programme.reduce((s, r) => s + r.shab, 0);
          const finMap = { BRS: { bg: "rgba(2,132,199,0.12)", color: C.blue }, LLI: { bg: "rgba(22,163,74,0.12)", color: C.green } };
          const getF = f => finMap[f] || { bg: "rgba(124,58,237,0.12)", color: C.purple };
          return (
            <div className="card">
              <SectionTitle>Programme complet</SectionTitle>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Financement", "Cage", "Logement", "Typo", "SHAB (m²)"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programme.map((r, i) => {
                    const s = getF(r.financement);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "5px 8px" }}>
                          <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "var(--mono)" }}>{r.financement}</span>
                        </td>
                        <td style={{ padding: "5px 8px", fontSize: 12, color: C.dim }}>{r.cage}</td>
                        <td style={{ padding: "5px 8px", fontSize: 12 }}>{r.logement}</td>
                        <td style={{ padding: "5px 8px", fontSize: 12, fontFamily: "var(--mono)", color: C.purple }}>{r.typo}</td>
                        <td style={{ padding: "5px 8px", fontSize: 12, fontFamily: "var(--mono)" }}>{r.shab.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border)" }}>
                    <td colSpan={4} style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, color: C.dim }}>Total SHAB</td>
                    <td style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: C.blue }}>{totalShab.toFixed(2)} m²</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        {/* Nbre Logements par Cage */}
        {nbreLgtCage && nbreLgtCage.length > 0 && (() => {
          const total = nbreLgtCage.reduce((s, r) => s + r.nombre, 0);
          return (
            <div className="card">
              <SectionTitle>Nombre de logements par cage</SectionTitle>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Cage", "Nombre de logements"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nbreLgtCage.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 8px", fontSize: 12, color: C.dim }}>{r.cage}</td>
                      <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: C.orange }}>{r.nombre}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border)" }}>
                    <td style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, color: C.dim }}>Total</td>
                    <td style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: C.blue }}>{total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        {/* SHAB par Typologie */}
        {shabTypo && shabTypo.length > 0 && (() => {
          const total = shabTypo.reduce((s, r) => s + r.shab, 0);
          const colors = [C.blue, C.green, C.orange, C.purple, C.yellow];
          return (
            <div className="card">
              <SectionTitle>SHAB par Typologie</SectionTitle>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Typologie", "SHAB total (m²)"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shabTypo.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 8px" }}>
                        <span style={{ background: colors[i % 5] + "20", color: colors[i % 5], padding: "2px 10px", borderRadius: 4, fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700 }}>{r.typo}</span>
                      </td>
                      <td style={{ padding: "6px 8px", fontSize: 12, fontFamily: "var(--mono)" }}>{r.shab.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border)" }}>
                    <td style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, color: C.dim }}>Total</td>
                    <td style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: C.blue }}>{total.toFixed(2)} m²</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

// ── TAB: PARKING ──────────────────────────────────────────────────────────────
function TabParking({ data }) {
  const { parking } = data;
  const voiture = parking.filter(p => !p.type.toLowerCase().includes("vélo"));
  const velo = parking.filter(p => p.type.toLowerCase().includes("vélo"));
  const totalV = voiture.reduce((s, p) => s + p.count, 0);
  const totalVelo = velo.reduce((s, p) => s + p.count, 0);

  const TableParking = ({ rows, total, titre, color }) => (
    <div className="card">
      <SectionTitle>{titre}</SectionTitle>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            {["Type", "Nb", "Niveau"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "6px 0", color: C.muted, fontSize: 10, letterSpacing: 1 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: "6px 0", color: C.dim, fontSize: 12 }}>{p.type}</td>
              <td style={{ padding: "6px 0", color, fontWeight: 700 }}>{p.count}</td>
              <td style={{ padding: "6px 0", color: C.muted, fontSize: 11 }}>{p.niveau}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ padding: "8px 0 2px", borderTop: "1px solid var(--border)", color: C.dim, fontSize: 11, fontWeight: 700 }}>Total</td>
            <td style={{ padding: "8px 0 2px", borderTop: "1px solid var(--border)", color, fontWeight: 700, fontSize: 14 }}>{total}</td>
            <td style={{ borderTop: "1px solid var(--border)" }} />
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <TableParking rows={voiture} total={totalV} titre="🚗 Places de parking" color={C.orange} />
        {velo.length > 0 && (
          <TableParking rows={velo} total={totalVelo} titre="🚲 Places vélo" color={C.green} />
        )}
      </div>
    </div>
  );
}

// ── TAB: QUALITÉ ──────────────────────────────────────────────────────────────
function TabQualite({ data }) {
  const [subTab, setSubTab] = useState("orientation");

  const SUB_TABS = [
    { key: "orientation", label: "Orientation" },
    { key: "pieces",      label: "Pièces" },
    { key: "chambres",    label: "Chambres" },
    { key: "placards",    label: "Placards" },
    { key: "mobilier",    label: "Mobilier" },
    { key: "cellier",     label: "Cellier" },
    { key: "annexes",     label: "Annexes" },
  ];

  const SubNav = () => (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
      {SUB_TABS.map(t => (
        <button key={t.key} onClick={() => setSubTab(t.key)} style={{
          padding: "6px 16px", borderRadius: 20,
          border: `1px solid ${subTab === t.key ? C.blue : "var(--border)"}`,
          background: subTab === t.key ? "rgba(2,132,199,0.1)" : "transparent",
          color: subTab === t.key ? C.blue : C.muted,
          fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)", letterSpacing: "0.5px",
          fontWeight: subTab === t.key ? 600 : 400,
        }}>{t.label}</button>
      ))}
    </div>
  );

  // ── Orientation ─────────────────────────────────────────────────────────────
  const OrientationContent = () => {
    const { orientation } = data;
    const [filter, setFilter] = useState("ALL");
    const orTypes = [...new Set(orientation.map(o => o.orientation))];
    const filtered = filter === "ALL" ? orientation : orientation.filter(o => o.orientation === filter);
    const counts = orTypes.map(t => ({ name: t, count: orientation.filter(o => o.orientation === t).length }));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div className="card">
          <SectionTitle>Répartition orientation</SectionTitle>
          {counts.map((c, i) => {
            const pct = Math.round(c.count / orientation.length * 100);
            const col = [C.blue, C.green, C.orange, C.purple][i % 4];
            return (
              <div key={c.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: col, fontSize: 12 }}>{c.name}</span>
                  <span style={{ color: C.dim, fontSize: 12 }}>{c.count} <span style={{ color: C.muted }}>({pct}%)</span></span>
                </div>
                <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ marginBottom: 14, display: "flex", gap: 10 }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="ALL">Toutes orientations</option>
              {orTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ color: C.muted, fontSize: 11, alignSelf: "center" }}>{filtered.length} logements</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Logement</th><th>Orientation</th></tr></thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={i}>
                    <td style={{ color: C.blue }}>{o.logement}</td>
                    <td>
                      <span className="pill" style={{
                        background: o.orientation === "Double" ? "rgba(22,163,74,0.12)" : "rgba(2,132,199,0.1)",
                        color: o.orientation === "Double" ? C.green : C.blue,
                        border: `1px solid ${o.orientation === "Double" ? "#16a34a44" : "#0284c744"}`
                      }}>{o.orientation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── Pièces (Entrée / SDB / WC) ───────────────────────────────────────────────
  const PiecesContent = () => {
    const [pieceType, setPieceType] = useState("ENTREE");
    const [typoFilter, setTypoFilter] = useState("ALL");
    const pieceData = { ENTREE: data.qualEntree || [], SDB: data.qualSDB || [], WC: data.qualWC || [] };
    const rows = pieceData[pieceType].filter(r => r.typo !== "T1");
    const typos = [...new Set(rows.map(r => r.typo))].sort();
    const filtered = typoFilter === "ALL" ? rows : rows.filter(r => r.typo === typoFilter);
    const pieceColors = { ENTREE: C.green, SDB: C.blue, WC: C.orange };
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          {Object.keys(pieceData).map(p => (
            <button key={p} onClick={() => { setPieceType(p); setTypoFilter("ALL"); }} style={{
              padding: "4px 14px", borderRadius: 6,
              border: `1px solid ${pieceType === p ? pieceColors[p] : "var(--border)"}`,
              background: pieceType === p ? `rgba(${p === "ENTREE" ? "22,163,74" : p === "SDB" ? "2,132,199" : "234,88,12"},0.1)` : "transparent",
              color: pieceType === p ? pieceColors[p] : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)",
            }}>{p}</button>
          ))}
          <select value={typoFilter} onChange={e => setTypoFilter(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="ALL">Toutes typologies</option>
            {typos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ color: C.muted, fontSize: 11 }}>{filtered.length} logements</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Logement</th><th>Typologie</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => {
                const isGreen =
                  pieceType === "ENTREE" ||
                  ((pieceType === "SDB" || pieceType === "WC") && ["T3", "T4", "T5"].includes(r.typo));
                return (
                  <tr key={i}>
                    <td style={{ color: isGreen ? C.green : C.blue, fontWeight: isGreen ? 600 : 400 }}>{r.logement}</td>
                    <td><span className="pill" style={{ background: isGreen ? "rgba(22,163,74,0.1)" : "rgba(2,132,199,0.08)", color: isGreen ? C.green : C.blue, border: `1px solid ${isGreen ? "#16a34a44" : "#0284c744"}` }}>{r.typo}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Chambres ─────────────────────────────────────────────────────────────────
  const ChambresContent = () => {
    const rows = data.qualChambre || [];
    const [logtFilter, setLogtFilter] = useState("ALL");
    const logements = [...new Set(rows.map(r => r.logement))].sort();
    const filtered = logtFilter === "ALL" ? rows : rows.filter(r => r.logement === logtFilter);
    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <select value={logtFilter} onChange={e => setLogtFilter(e.target.value)}>
            <option value="ALL">Tous les logements</option>
            {logements.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <span style={{ color: C.muted, fontSize: 11 }}>{filtered.length} chambres</span>
          <span style={{ color: C.red, fontSize: 11 }}>● &lt; 10.5 m²</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Logement</th><th>Chambre</th><th style={{ textAlign: "right" }}>Surface (m²)</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => {
                const ko = r.surface < 10.5;
                return (
                  <tr key={i}>
                    <td style={{ color: C.blue }}>{r.logement}</td>
                    <td style={{ color: C.dim }}>{r.nom}</td>
                    <td style={{ textAlign: "right", color: ko ? C.red : C.green, fontWeight: ko ? 700 : 400 }}>
                      {r.surface.toFixed(2)} {ko && <span style={{ fontSize: 10 }}>⚠</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Placards ─────────────────────────────────────────────────────────────────
  const PlacardsContent = () => {
    const rows = data.qualPlacard || [];
    const [typoFilter, setTypoFilter] = useState("ALL");
    const typos = [...new Set(rows.map(r => r.typo))].sort();
    const filteredRows = typoFilter === "ALL" ? rows : rows.filter(r => r.typo === typoFilter);

    // Grouper par logement : total nb + total largeur
    const grouped = {};
    filteredRows.forEach(r => {
      if (!grouped[r.logement]) grouped[r.logement] = { logement: r.logement, typo: r.typo, totalNb: 0, totalLargeur: 0 };
      grouped[r.logement].totalNb += r.nombre;
      grouped[r.logement].totalLargeur += r.largeur;
    });
    const groupedRows = Object.values(grouped).sort((a, b) => a.logement.localeCompare(b.logement));

    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <select value={typoFilter} onChange={e => setTypoFilter(e.target.value)}>
            <option value="ALL">Toutes typologies</option>
            {typos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ color: C.muted, fontSize: 11 }}>{groupedRows.length} logements</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Logement</th>
                <th>Typo</th>
                <th style={{ textAlign: "right" }}>Total placards</th>
                <th style={{ textAlign: "right" }}>Largeur totale</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: C.blue, fontWeight: 600 }}>{r.logement}</td>
                  <td><span className="pill" style={{ background: "rgba(2,132,199,0.08)", color: C.blue, border: "1px solid #0284c744" }}>{r.typo}</span></td>
                  <td style={{ textAlign: "right", color: C.orange, fontWeight: 700 }}>{r.totalNb}</td>
                  <td style={{ textAlign: "right", color: C.dim, fontSize: 12 }}>{r.totalLargeur.toFixed(2)} m</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ paddingTop: 8, borderTop: "1px solid var(--border)", color: C.dim, fontWeight: 700, fontSize: 11 }}>Total</td>
                <td style={{ paddingTop: 8, borderTop: "1px solid var(--border)", textAlign: "right", color: C.orange, fontWeight: 700, fontSize: 14 }}>{groupedRows.reduce((s, r) => s + r.totalNb, 0)}</td>
                <td style={{ paddingTop: 8, borderTop: "1px solid var(--border)", textAlign: "right", color: C.dim, fontWeight: 700 }}>{groupedRows.reduce((s, r) => s + r.totalLargeur, 0).toFixed(2)} m</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // ── Mobilier ─────────────────────────────────────────────────────────────────
  const MobilierContent = () => {
    const rows = (data.qualMobilier || []).filter(r => !r.famille.toLowerCase().includes("placard"));
    const [typoFilter, setTypoFilter] = useState("ALL");
    const [pieceFilter, setPieceFilter] = useState("ALL");
    const typos = [...new Set(rows.map(r => r.typo))].sort();
    const pieces = [...new Set(rows.filter(r => typoFilter === "ALL" || r.typo === typoFilter).map(r => r.piece))].sort();
    const filtered = rows
      .filter(r => typoFilter === "ALL" || r.typo === typoFilter)
      .filter(r => pieceFilter === "ALL" || r.piece === pieceFilter);

    // Grouper par lot (numéro de logement)
    const lots = [...new Set(filtered.map(r => r.lot))];
    const byLot = lots.reduce((acc, lot) => {
      const lotRows = filtered.filter(r => r.lot === lot);
      acc[lot] = { typo: lotRows[0]?.typo || "", rows: lotRows, total: lotRows.reduce((s, r) => s + r.nombre, 0) };
      return acc;
    }, {});
    const grandTotal = filtered.reduce((s, r) => s + r.nombre, 0);

    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          <select value={typoFilter} onChange={e => { setTypoFilter(e.target.value); setPieceFilter("ALL"); }}>
            <option value="ALL">Toutes typologies</option>
            {typos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={pieceFilter} onChange={e => setPieceFilter(e.target.value)}>
            <option value="ALL">Toutes pièces</option>
            {pieces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span style={{ color: C.muted, fontSize: 11 }}>{filtered.length} éléments · {lots.length} logements</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Logement</th><th>Typo</th><th>Pièce</th><th>Mobilier</th><th style={{ textAlign: "right" }}>Nb</th><th style={{ textAlign: "right" }}>Total lot</th></tr></thead>
            <tbody>
              {lots.map(lot => {
                const { typo, rows: lotRows, total } = byLot[lot];
                return lotRows.map((r, i) => (
                  <tr key={`${lot}-${i}`}>
                    <td style={{ color: C.blue }}>{i === 0 ? r.lot : ""}</td>
                    <td>{i === 0 ? <span className="pill" style={{ background: "rgba(2,132,199,0.08)", color: C.blue, border: "1px solid #0284c744" }}>{typo}</span> : ""}</td>
                    <td style={{ color: C.dim }}>{r.piece}</td>
                    <td style={{ color: C.muted, fontSize: 11 }}>{r.famille}</td>
                    <td style={{ textAlign: "right", color: C.orange, fontWeight: 700 }}>{r.nombre}</td>
                    <td style={{ textAlign: "right" }}>
                      {i === 0
                        ? <span style={{ background: "rgba(234,88,12,0.1)", color: C.orange, border: "1px solid #ea580c44", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 12 }}>{total}</span>
                        : ""}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ paddingTop: 8, borderTop: "1px solid var(--border)", color: C.dim, fontWeight: 700, fontSize: 11 }}>Total général</td>
                <td style={{ paddingTop: 8, borderTop: "1px solid var(--border)", textAlign: "right", color: C.orange, fontWeight: 700, fontSize: 14 }}>{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // ── Cellier ──────────────────────────────────────────────────────────────────
  const CellierContent = () => {
    const celliersSet = new Set((data.qualCellier || []).map(r => r.logement));
    // Référence : tous les logements T3/T4/T5 depuis qualEntree
    const tousLogements = (data.qualEntree || []).filter(r => ["T3", "T4", "T5"].includes(r.typo));
    const nbPresents = tousLogements.filter(r => celliersSet.has(r.logement)).length;
    return (
      <div style={{ maxWidth: 500 }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: C.green }}>✓ Présent : {nbPresents}</span>
          <span style={{ fontSize: 11, color: C.red }}>✗ Absent : {tousLogements.length - nbPresents}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Logement</th><th>Typologie</th><th style={{ textAlign: "center" }}>Cellier</th></tr></thead>
            <tbody>
              {tousLogements.map((r, i) => {
                const present = celliersSet.has(r.logement);
                return (
                  <tr key={i}>
                    <td style={{ color: present ? C.green : C.red, fontWeight: 600 }}>{r.logement}</td>
                    <td><span className="pill" style={{ background: present ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)", color: present ? C.green : C.red, border: `1px solid ${present ? "#16a34a44" : "#dc262644"}` }}>{r.typo}</span></td>
                    <td style={{ textAlign: "center", fontSize: 14 }}>{present ? "✓" : "✗"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ paddingTop: 8, borderTop: "1px solid var(--border)", color: C.dim, fontWeight: 700, fontSize: 11 }}>Total avec cellier</td>
                <td style={{ paddingTop: 8, borderTop: "1px solid var(--border)", textAlign: "center", color: C.blue, fontWeight: 700, fontSize: 14 }}>{nbPresents} / {tousLogements.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // ── Annexes ──────────────────────────────────────────────────────────────────
  const AnnexesContent = () => {
    const rows = data.qualAnnexes || [];
    const [nomFilter, setNomFilter] = useState("ALL");
    const noms = [...new Set(rows.map(r => r.nom))].sort();
    const filtered = nomFilter === "ALL" ? rows : rows.filter(r => r.nom === nomFilter);
    const total = filtered.reduce((s, r) => s + r.surface, 0);
    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <select value={nomFilter} onChange={e => setNomFilter(e.target.value)}>
            <option value="ALL">Tous types</option>
            {noms.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={{ color: C.muted, fontSize: 11 }}>{filtered.length} éléments</span>
          <span style={{ color: C.blue, fontSize: 11, fontWeight: 600 }}>Total : {total.toFixed(2)} m²</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Logement</th><th>Type</th><th style={{ textAlign: "right" }}>Surface (m²)</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: C.blue }}>{r.logement}</td>
                  <td style={{ color: C.dim }}>{r.nom}</td>
                  <td style={{ textAlign: "right", color: C.green, fontWeight: 600 }}>{r.surface.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <SubNav />
      {subTab === "orientation" && <OrientationContent />}
      {subTab === "pieces"      && <PiecesContent />}
      {subTab === "chambres"    && <ChambresContent />}
      {subTab === "placards"    && <PlacardsContent />}
      {subTab === "mobilier"    && <MobilierContent />}
      {subTab === "cellier"     && <CellierContent />}
      {subTab === "annexes"     && <AnnexesContent />}
    </div>
  );
}

// ── TAB: MODULE CUISINE ───────────────────────────────────────────────────────
function TabCuisine({ data }) {
  const { cuisine } = data;
  const [filter, setFilter] = useState("ALL");
  const typos = [...new Set(cuisine.map(c => c.typo))].sort();
  const filtered = filter === "ALL" ? cuisine : cuisine.filter(c => c.typo === filter);
  const avgByTypo = typos.map(t => {
    const lgs = cuisine.filter(c => c.typo === t);
    const avg = lgs.reduce((s, l) => s + l.total, 0) / lgs.length;
    return { typo: t, avg: avg.toFixed(1), count: lgs.length };
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {avgByTypo.map((t, i) => (
          <div className="card" key={t.typo} style={{ borderLeft: `3px solid ${[C.blue, C.green, C.orange][i % 3]}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: [C.blue, C.green, C.orange][i % 3] }}>{t.avg}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>éléments moy.</div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{t.typo} · {t.count} lgt</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14, display: "flex", gap: 10 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">Toutes typologies</option>
          {typos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ color: C.muted, fontSize: 11, alignSelf: "center" }}>{filtered.length} logements</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Logement</th><th>Typo</th><th>Éléments cuisine</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i}>
                <td style={{ color: C.blue }}>{c.num}</td>
                <td><span style={{ color: C.blue, fontWeight: 600 }}>{c.typo}</span></td>
                <td style={{ color: C.muted, fontSize: 11, maxWidth: 300 }}>{c.elements.slice(0, 3).join(" · ")}{c.elements.length > 3 ? ` +${c.elements.length - 3}` : ""}</td>
                <td style={{ textAlign: "right", color: C.orange, fontWeight: 700 }}>{c.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ paddingTop: 8, borderTop: "1px solid var(--border)", color: C.dim, fontWeight: 700, fontSize: 11 }}>Total — {filtered.length} logements</td>
              <td style={{ paddingTop: 8, borderTop: "1px solid var(--border)", textAlign: "right", color: C.orange, fontWeight: 700, fontSize: 14 }}>{filtered.reduce((s, c) => s + c.total, 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── PARTIES COMMUNES ──────────────────────────────────────────────────────────
function TabPartieCommune({ data }) {
  const rows = data.partieCommune || [];
  const services = [...new Set(rows.map(r => r.service))];
  const total = rows.reduce((s, r) => s + r.surface, 0);

  return (
    <div style={{ padding: 24 }}>
      <div className="section-title" style={{ marginBottom: 16 }}>Parties communes</div>
      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Service", "Nom", "Surface (m²)"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, borderBottom: `1px solid var(--border)` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(svc => {
              const group = rows.filter(r => r.service === svc);
              return group.map((r, i) => (
                <tr key={`${svc}-${i}`} style={{ borderBottom: `1px solid var(--border)` }}>
                  <td style={{ padding: "6px 8px", fontSize: 12, color: i === 0 ? C.dim : "transparent", fontWeight: i === 0 ? 600 : 400 }}>{svc}</td>
                  <td style={{ padding: "6px 8px", fontSize: 12 }}>{r.nom}</td>
                  <td style={{ padding: "6px 8px", fontSize: 12, fontFamily: "var(--mono)" }}>{r.surface.toFixed(2)}</td>
                </tr>
              ));
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid var(--border)` }}>
              <td colSpan={2} style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, color: C.dim }}>Total</td>
              <td style={{ padding: "8px 8px", fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", color: C.blue }}>{total.toFixed(2)} m²</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── ANNEXES ───────────────────────────────────────────────────────────────────
function TabAnnexes({ data }) {
  const balcons = data.balcon || [];
  const terrasses = data.terrasse || [];
  const surfaces = data.surfaceAnnexes || [];

  const totalBalconSurf = balcons.reduce((s, r) => s + r.surface, 0);
  const totalBalconNb   = balcons.reduce((s, r) => s + r.nombre, 0);
  const totalTerrasseSurf = terrasses.reduce((s, r) => s + r.surface, 0);
  const totalTerrasseNb   = terrasses.reduce((s, r) => s + r.nombre, 0);
  const totalSurfaces = surfaces.reduce((s, r) => s + r.surface, 0);

  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thStyle = { textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, borderBottom: `1px solid var(--border)` };
  const tdStyle = { padding: "6px 8px", fontSize: 12, borderBottom: `1px solid var(--border)` };
  const monoStyle = { ...tdStyle, fontFamily: "var(--mono)" };
  const footTd = { padding: "8px 8px", fontSize: 12, fontWeight: 700 };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="section-title">Annexes</div>

      {/* Balcons */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Balcons</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Lot", "Nom", "Surface (m²)", "Nombre"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {balcons.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.lot}</td>
                  <td style={tdStyle}>{r.nom}</td>
                  <td style={monoStyle}>{r.surface.toFixed(2)}</td>
                  <td style={monoStyle}>{r.nombre}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={2} style={{ ...footTd, color: C.dim }}>Total</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{totalBalconSurf.toFixed(2)} m²</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{totalBalconNb}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Terrasses */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Terrasses</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Lot", "Nom", "Surface (m²)", "Nombre"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {terrasses.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.lot}</td>
                  <td style={tdStyle}>{r.nom}</td>
                  <td style={monoStyle}>{r.surface.toFixed(2)}</td>
                  <td style={monoStyle}>{r.nombre}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={2} style={{ ...footTd, color: C.dim }}>Total</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{totalTerrasseSurf.toFixed(2)} m²</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{totalTerrasseNb}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Surfaces Annexes */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Surfaces Annexes</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Logement", "Nom", "Surface (m²)"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {surfaces.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.logement}</td>
                  <td style={tdStyle}>{r.nom}</td>
                  <td style={monoStyle}>{r.surface.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={2} style={{ ...footTd, color: C.dim }}>Total</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{totalSurfaces.toFixed(2)} m²</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── COMPACITÉ ─────────────────────────────────────────────────────────────────
function TabCompacite({ data }) {
  const fens    = data.compaciteFen    || [];
  const murs    = data.compaciteMurs   || [];
  const portes  = data.compacitePortes || [];
  const shabs   = data.compaciteShab   || [];

  const totalFen   = fens.reduce((s, r) => s + r.surface, 0);
  const totalMur   = murs.reduce((s, r) => s + r.surface, 0);
  const totalPorte = portes.reduce((s, r) => s + r.surface, 0);
  const totalShab  = shabs.reduce((s, r) => s + r.shab, 0);
  const compacite  = totalShab > 0 ? (totalFen + totalMur + totalPorte) / totalShab : 0;

  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thStyle = { textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, borderBottom: `1px solid var(--border)` };
  const tdStyle = { padding: "6px 8px", fontSize: 12, borderBottom: `1px solid var(--border)` };
  const monoStyle = { ...tdStyle, fontFamily: "var(--mono)" };
  const footTd = { padding: "8px 8px", fontSize: 12, fontWeight: 700 };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="section-title">Compacité</div>

      {/* Tableau général */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: C.dim, marginBottom: 12 }}>Tableau général — Ratio de compacité</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { label: "Total Fenêtres", value: totalFen.toFixed(2) + " m²", color: C.blue },
            { label: "Total Murs",     value: totalMur.toFixed(2) + " m²", color: C.orange },
            { label: "Total Portes",   value: totalPorte.toFixed(2) + " m²", color: C.purple },
            { label: "Total SHAB",     value: totalShab.toFixed(2) + " m²", color: C.green },
          ].map(kpi => (
            <div key={kpi.label} style={{ flex: "1 1 140px", background: "var(--bg)", border: `1px solid var(--border)`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{kpi.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)", color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
          <div style={{ flex: "1 1 140px", background: C.blue + "18", border: `2px solid ${C.blue}`, borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Compacité (FEN+MUR+PORTE) / SHAB</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--mono)", color: C.blue }}>{compacite.toFixed(3)}</div>
          </div>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              {["Poste", "Surface totale (m²)", "% du SHAB"].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Fenêtres extérieures", val: totalFen },
              { label: "Murs extérieurs",      val: totalMur },
              { label: "Portes extérieures",   val: totalPorte },
            ].map(row => (
              <tr key={row.label}>
                <td style={tdStyle}>{row.label}</td>
                <td style={monoStyle}>{row.val.toFixed(2)}</td>
                <td style={monoStyle}>{totalShab > 0 ? ((row.val / totalShab) * 100).toFixed(1) + " %" : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid var(--border)` }}>
              <td style={{ ...footTd, color: C.dim }}>Total enveloppe</td>
              <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{(totalFen + totalMur + totalPorte).toFixed(2)} m²</td>
              <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{compacite.toFixed(3)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Fenêtres */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Fenêtres extérieures (FEN)</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Famille et type", "Famille", "Largeur", "Hauteur", "Surface (m²)"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {fens.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.familleType}</td>
                  <td style={tdStyle}>{r.famille}</td>
                  <td style={monoStyle}>{r.largeur.toFixed(2)}</td>
                  <td style={monoStyle}>{r.hauteur.toFixed(2)}</td>
                  <td style={monoStyle}>{r.surface.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={4} style={{ ...footTd, color: C.dim }}>Total</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.blue }}>{totalFen.toFixed(2)} m²</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Murs */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Murs extérieurs (MUR)</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Famille", "Type", "Matériau", "Largeur", "Longueur", "Surface (m²)", "Fonction"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {murs.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.famille}</td>
                  <td style={tdStyle}>{r.type}</td>
                  <td style={tdStyle}>{r.materiau}</td>
                  <td style={monoStyle}>{r.largeur}</td>
                  <td style={monoStyle}>{r.longueur.toFixed(2)}</td>
                  <td style={monoStyle}>{r.surface.toFixed(2)}</td>
                  <td style={tdStyle}>{r.fonction}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={5} style={{ ...footTd, color: C.dim }}>Total</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.orange }}>{totalMur.toFixed(2)} m²</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Portes */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Portes extérieures (PORTE)</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Famille et type", "Famille", "Largeur", "Hauteur", "Surface (m²)"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {portes.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.familleType}</td>
                  <td style={tdStyle}>{r.famille}</td>
                  <td style={monoStyle}>{r.largeur.toFixed(2)}</td>
                  <td style={monoStyle}>{r.hauteur.toFixed(2)}</td>
                  <td style={monoStyle}>{r.surface.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={4} style={{ ...footTd, color: C.dim }}>Total</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.purple }}>{totalPorte.toFixed(2)} m²</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SHAB */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dim, marginBottom: 8 }}>Surfaces habitables (SHAB)</div>
        <div className="card">
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Logement", "Pièce", "Typo", "SHAB (m²)", "Service"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shabs.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{r.logement}</td>
                  <td style={tdStyle}>{r.nom}</td>
                  <td style={tdStyle}>{r.typo}</td>
                  <td style={monoStyle}>{r.shab.toFixed(2)}</td>
                  <td style={tdStyle}>{r.service}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid var(--border)` }}>
                <td colSpan={3} style={{ ...footTd, color: C.dim }}>Total SHAB</td>
                <td style={{ ...footTd, fontFamily: "var(--mono)", color: C.green }}>{totalShab.toFixed(2)} m²</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── PAGES VIDES ───────────────────────────────────────────────────────────────
function TabVide({ titre }) {
  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.dim, marginBottom: 6 }}>{titre}</div>
        <div style={{ fontSize: 12 }}>Contenu à venir</div>
      </div>
    </div>
  );
}

// ── TABS DEF ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: "programme",      label: "📊 Données programme", Comp: TabProgramme },
  { key: "partiesCommunes",label: "🏢 Parties communes",  Comp: TabPartieCommune },
  { key: "parking",        label: "🅿️ Parking",           Comp: TabParking },
  { key: "annexes",        label: "📦 Annexes",            Comp: TabAnnexes },
  { key: "qualite",        label: "✅ Qualité",            Comp: TabQualite },
  { key: "compacite",      label: "📐 Compacité",          Comp: TabCompacite },
];

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard({ data, onReset }) {
  const [tab, setTab] = useState("programme");
  const active = TABS.find(t => t.key === tab);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn-reset" onClick={onReset} style={{ margin: "12px 12px 0" }}>↩ Nouveau fichier</button>
      </aside>

      <div className="dashboard-content">
        {active && <active.Comp data={data} />}
      </div>
    </div>
  );
}
