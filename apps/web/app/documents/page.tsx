"use client";

import { useState } from "react";
import AppHeader from "../components/AppHeader";

export default function DocumentsPage() {
  const [checked, setChecked] = useState([true, true, false, false]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generateBundle() {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("http://localhost:4000/api/documents/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: ["ZAM", "ZUR3", "ZAO4"] }),
      });
      if (!response.ok) throw new Error("Nie udało się przygotować pakietu");
      const data = await response.json(); setMessage(`Pakiet ${data.bundleName} jest gotowy do pobrania.`);
    } catch (err: unknown) { setMessage(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd."); }
    finally { setLoading(false); }
  }

  const documents = ["WNIOSEK ZAM", "ZUS ZLA", "ZAO4 — zaświadczenie o urodzeniu", "Zaświadczenie pracodawcy"];

  return (
    <main><AppHeader active="/documents" />
      <section className="tab-page">
        <div className="tab-heading"><div><p className="eyebrow">DOCUMENTS</p><h1>Dokumenty i formularze</h1></div><b className="completion">68% gotowe</b></div>
        <div className="tab-grid documents-grid">
          <section className="card document-list-card"><h2>Lista kontrolna</h2>
            {documents.map((doc, i) => <label key={doc} className="check"><input type="checkbox" checked={checked[i]} onChange={() => setChecked((current) => current.map((value, index) => index === i ? !value : value))} /><span>{checked[i] ? "✓" : ""}</span><div><b>{doc}</b><small>{checked[i] ? "Gotowe" : "Wymaga uzupełnienia"}</small></div></label>)}
            <button className="primary full" type="button" onClick={generateBundle} disabled={loading}>{loading ? "Przygotowywanie…" : "Generuj pakiet ZAM / ZUR3 / ZAO4"}</button>
            {message && <p className="form-message" aria-live="polite">{message}</p>}
          </section>
          <section className="card upload-card"><p className="eyebrow">PARSER PDF</p><h2>Dodaj dokument</h2><div className="upload-zone"><span>PDF</span><b>Przeciągnij plik lub wybierz go z dysku</b><small>Obsługiwane: PDF, maks. 10 MB</small><button className="outline" type="button">Wybierz plik</button></div></section>
        </div>
      </section>
    </main>
  );
}
