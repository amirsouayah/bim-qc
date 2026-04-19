import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import Dashboard from "./components/Dashboard";
import DropZone from "./components/DropZone";
import "./App.css";

function parseSheet(file, sheetIndex = 0) {
  const wb = XLSX.read(file, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[sheetIndex]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
}

function parseNbreLogements(rows) {
  return rows.slice(1).filter(r => r[0] && r[0] !== "Total général").map(r => ({
    typo: r[0].toString().trim(),
    count: parseInt(r[1]) || 0,
  }));
}

function parseNbreLogementsByNiveau(rows) {
  return rows.slice(1).filter(r => r[0] && r[0] !== "Total général").map(r => ({
    niveau: r[0].toString().trim(),
    count: parseInt(r[1]) || 0,
  }));
}

function parseNbreCages(rows) {
  return rows.slice(2).filter(r => r[0]).map(r => ({
    financement: r[0].toString().trim(),
    cage: r[1].toString().trim(),
  }));
}

function parseParking(rows) {
  return rows.slice(1).filter(r => r[0] && r[0].toString().trim() !== "").map(r => ({
    type: r[0].toString().trim(),
    count: parseInt(r[1]) || 0,
    niveau: r[2]?.toString().trim() || "",
  }));
}

function parseOrientation(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    orientation: r[1].toString().trim(),
    count: parseInt(r[2]) || 1,
  }));
}

function parsePartieCommune(rows) {
  return rows.slice(1).filter(r => r[0] && r[1]).map(r => ({
    service: r[0].toString().trim(),
    nom: r[1].toString().trim(),
    surface: parseFloat(r[2]) || 0,
  }));
}

// ── PARSERS QUALITÉ ───────────────────────────────────────────────────────────
// Entrée / SDB / WC / Cellier → { logement, typo }
function parseQualPieceTypo(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    typo: r[2]?.toString().trim() || "",
  }));
}

// Chambres → { logement, nom, surface }
function parseQualChambre(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    nom: r[1]?.toString().trim() || "",
    surface: parseFloat(r[2]) || 0,
  })).filter(r => r.surface > 0);
}

// Placards → { logement, typo, piece, largeur, nombre }
function parseQualPlacard(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    typo: r[2]?.toString().trim() || "",
    piece: r[3]?.toString().trim() || "",
    largeur: parseFloat(r[5]) || 0,
    nombre: parseInt(r[6]) || 0,
  }));
}

// Mobilier → { lot, typo, piece, famille, nombre }
function parseQualMobilier(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    lot: r[0].toString().trim(),
    typo: r[1]?.toString().trim() || "",
    piece: r[2]?.toString().trim() || "",
    famille: r[3]?.toString().trim() || "",
    nombre: parseInt(r[4]) || 0,
  }));
}

// Annexes → { logement, nom, surface }
function parseQualAnnexes(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    nom: r[1]?.toString().trim() || "",
    surface: parseFloat(r[2]) || 0,
  }));
}

function parseProgramme(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    financement: r[0].toString().trim(),
    cage: r[1]?.toString().trim() || "",
    logement: r[2]?.toString().trim() || "",
    typo: r[3]?.toString().trim() || "",
    shab: parseFloat(r[4]) || 0,
  }));
}

function parseNbreLgtCage(rows) {
  return rows.slice(1).filter(r => r[0] && !r[0].toString().includes("Total")).map(r => ({
    cage: r[0].toString().trim(),
    nombre: parseInt(r[1]) || 0,
  }));
}

function parseShabTypo(rows) {
  return rows.slice(1).filter(r => r[0] && !r[0].toString().includes("Total")).map(r => ({
    typo: r[0].toString().trim(),
    shab: parseFloat(r[1]) || 0,
  }));
}

function parseBalcon(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    lot: r[0].toString().trim(),
    nom: r[1]?.toString().trim() || "",
    surface: parseFloat(r[2]) || 0,
    nombre: parseInt(r[3]) || 1,
  }));
}

function parseTerrasse(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    lot: r[0].toString().trim(),
    nom: r[1]?.toString().trim() || "",
    surface: parseFloat(r[2]) || 0,
    nombre: parseInt(r[3]) || 1,
  }));
}

function parseSurfaceAnnexes(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    nom: r[1]?.toString().trim() || "",
    surface: parseFloat(r[2]) || 0,
  }));
}

function parseCompaciteFen(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    familleType: r[0].toString().trim(),
    famille: r[1]?.toString().trim() || "",
    largeur: parseFloat(r[2]) || 0,
    hauteur: parseFloat(r[3]) || 0,
    surface: parseFloat(r[4]) || 0,
  }));
}

function parseCompaciteMurs(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    famille: r[0].toString().trim(),
    type: r[1]?.toString().trim() || "",
    materiau: r[2]?.toString().trim() || "",
    largeur: r[3]?.toString().trim() || "",
    longueur: parseFloat(r[4]) || 0,
    surface: parseFloat(r[5]) || 0,
    fonction: r[6]?.toString().trim() || "",
  }));
}

function parseCompacitePortes(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    familleType: r[0].toString().trim(),
    famille: r[1]?.toString().trim() || "",
    largeur: parseFloat(r[2]) || 0,
    hauteur: parseFloat(r[3]) || 0,
    surface: parseFloat(r[4]) || 0,
  }));
}

function parseCompaciteShab(rows) {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    logement: r[0].toString().trim(),
    nom: r[1]?.toString().trim() || "",
    typo: r[2]?.toString().trim() || "",
    shab: parseFloat(r[3]) || 0,
    service: r[4]?.toString().trim() || "",
  }));
}

function parseCuisine(rows) {
  const byLogement = {};
  rows.slice(1).forEach(r => {
    const num = r[0]?.toString().trim();
    if (!num) return;
    if (!byLogement[num]) byLogement[num] = { num, typo: r[1]?.toString().trim() || "", elements: [] };
    if (r[3]) byLogement[num].elements.push(r[3].toString().trim());
  });
  return Object.values(byLogement).map(l => ({ ...l, total: l.elements.length }));
}

export const FILE_DEFS = [
  // ── Programme ──────────────────────────────────────────────────────────────
  { key: "logements",     label: "Nbre Logements",           sample: "CDC_Nbre_Logements.xlsx",                           parse: parseNbreLogements },
  { key: "parNiveau",     label: "Logements par niveau",     sample: "CDC_Nbre_Logements_par_niveau.xlsx",                parse: parseNbreLogementsByNiveau },
  { key: "cages",         label: "Cages LLI/LLS",            sample: "CDC_Nbre_Cages_LLILLS.xlsx",                        parse: parseNbreCages },
  { key: "parking",       label: "Places Parking",           sample: "CDC_Nbre_Places_Parking.xlsx",                      parse: parseParking },
  { key: "partieCommune", label: "Parties Communes",         sample: "CDC_Partie_Commune.xlsx",                           parse: parsePartieCommune },
  { key: "cuisine",       label: "Module Cuisine",           sample: "CDC_Module_cuisine.xlsx",                           parse: parseCuisine },
  // ── Qualité ────────────────────────────────────────────────────────────────
  { key: "orientation",   label: "Qualité — Orientation",    sample: "qualite/CDC_Orientation.xlsx",                      parse: parseOrientation },
  { key: "qualEntree",    label: "Qualité — Entrées",        sample: "qualite/CDC_Entrée_Typologie.xlsx",                 parse: parseQualPieceTypo },
  { key: "qualSDB",       label: "Qualité — SDB",            sample: "qualite/CDC_SDB_Typologie.xlsx",                    parse: parseQualPieceTypo },
  { key: "qualWC",        label: "Qualité — WC",             sample: "qualite/CDC_WC_Typologie.xlsx",                     parse: parseQualPieceTypo },
  { key: "qualChambre",   label: "Qualité — Chambres",       sample: "qualite/CDC_Chambre_10.5.xlsx",                     parse: parseQualChambre },
  { key: "qualCellier",   label: "Qualité — Celliers",       sample: "qualite/CDC_Cellier_T3.xlsx",                       parse: parseQualPieceTypo },
  { key: "qualPlacard",   label: "Qualité — Placards",       sample: "qualite/CDC_Nbr_Placard_logt.xlsx",                 parse: parseQualPlacard },
  { key: "qualMobilier",  label: "Qualité — Mobilier",       sample: "qualite/CDC_Mobilier.xlsx",                         parse: parseQualMobilier },
  { key: "qualAnnexes",   label: "Qualité — Annexes surf.",  sample: "qualite/CDC_Surface_Annexes_inf9.xlsx",             parse: parseQualAnnexes },
  // ── Programme (nouveaux) ───────────────────────────────────────────────────
  { key: "programme",   label: "Programme complet",      sample: "CDC_Programme.xlsx",              parse: parseProgramme },
  { key: "nbreLgtCage", label: "Nbre Logements / Cage",  sample: "CDC_Nbre Logements_Cage.xlsx",    parse: parseNbreLgtCage },
  { key: "shabTypo",    label: "SHAB par Typologie",     sample: "CDC_SHAB_Typologie.xlsx",         parse: parseShabTypo },
  // ── Annexes ────────────────────────────────────────────────────────────────
  { key: "balcon",          label: "Annexes — Balcons",       sample: "CDC_Nbr_Lgt_Balcon.xlsx",          parse: parseBalcon },
  { key: "terrasse",        label: "Annexes — Terrasses",     sample: "CDC_Nbr_Lgt_Terrasse.xlsx",        parse: parseTerrasse },
  { key: "surfaceAnnexes",  label: "Annexes — Surfaces",      sample: "CDC_Surface_Annexes.xlsx",         parse: parseSurfaceAnnexes },
  // ── Compacité ──────────────────────────────────────────────────────────────
  { key: "compaciteFen",    label: "Compacité — Fenêtres",    sample: "CDC_Compacite_FEN_EXT.xlsx",       parse: parseCompaciteFen },
  { key: "compaciteMurs",   label: "Compacité — Murs",        sample: "CDC_Compacite_Murs_EXT.xlsx",      parse: parseCompaciteMurs },
  { key: "compacitePortes", label: "Compacité — Portes",      sample: "CDC_Compacite_PORTES_EXT.xlsx",    parse: parseCompacitePortes },
  { key: "compaciteShab",   label: "Compacité — SHAB",        sample: "CDC_Compacite_SHAB.xlsx",          parse: parseCompaciteShab },
];

export default function App() {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState({});

  const loadFile = useCallback((key, buffer) => {
    const def = FILE_DEFS.find(d => d.key === key);
    const rows = parseSheet(buffer, def.sheetIndex ?? 0);
    const parsed = def.parse(rows);
    setData(prev => ({ ...prev, [key]: parsed }));
    setLoaded(prev => ({ ...prev, [key]: true }));
  }, []);

  const loadSamples = useCallback(async () => {
    for (const def of FILE_DEFS) {
      try {
        const res = await fetch(encodeURI(`/${def.sample}`));
        const buf = await res.arrayBuffer();
        const rows = parseSheet(new Uint8Array(buf), def.sheetIndex ?? 0);
        const parsed = def.parse(rows);
        setData(prev => ({ ...prev, [def.key]: parsed }));
        setLoaded(prev => ({ ...prev, [def.key]: true }));
      } catch(e) { console.error(def.key, e); }
    }
  }, []);

  const allLoaded = FILE_DEFS.every(d => loaded[d.key]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">▣ BIM<span className="logo-dot">·</span>QC</div>
        <div className="header-sub">Contrôle de Programme — CDC Habitat IDF</div>
        <div className="header-right">
          {allLoaded
            ? <span className="badge badge-ok">✓ {FILE_DEFS.length} fichiers chargés</span>
            : <button className="btn-sample" onClick={loadSamples}>⚡ Charger les exemples</button>
          }
        </div>
      </header>

      {!allLoaded && (
        <DropZone defs={FILE_DEFS} loaded={loaded} onLoad={loadFile} onLoadSamples={loadSamples} />
      )}

      {allLoaded && (
        <Dashboard
          data={data}
          onReset={() => { setData({}); setLoaded({}); }}
        />
      )}
    </div>
  );
}
