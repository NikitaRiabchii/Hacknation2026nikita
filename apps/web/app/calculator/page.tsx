"use client";

import { useState } from "react";
import AppHeader from "../components/AppHeader";

const benefits = [
  ["sickness", "Zasiłek chorobowy", "100% podstawy", "#19a974"],
  ["maternity", "Zasiłek macierzyński", "70–81,5% podstawy", "#ef8b6c"],
  ["parental", "Zasiłek rodzicielski", "do 41 tygodni", "#6f67c9"],
  ["adoption", "Zasiłek z tytułu adopcji", "do 9 miesięcy", "#e2ad48"],
  ["foster", "Rodzina zastępcza", "Wsparcie miesięczne", "#4d99b8"],
  ["premature", "Zasiłek z tytułu wcześniaka", "70–81,5% podstawy", "#d98caa"],
  ["death", "Wsparcie po stracie dziecka", "Pomoc i zasiłek pogrzebowy", "#78828d"],
];

type CalculationResult = {
  monthly: number;
  months: number;
  estimatedTotal: number;
};

export default function CalculatorPage() {
  const [scenario, setScenario] = useState("maternity");
  const [basis, setBasis] = useState("5000");
  const [employment, setEmployment] = useState("Umowa o pracę");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    setLoading(true); setError("");
    try {
      const response = await fetch("http://localhost:4000/api/calculator/calculate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, basis: Number(basis), employmentType: employment, documents: ["ZAM", "ZUS ZLA"], startDate: "2026-04-15" }),
      });
      if (!response.ok) throw new Error("Błąd kalkulatora");
      setResult(await response.json());
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd."); }
    finally { setLoading(false); }
  }

  return (
    <main><AppHeader active="/calculator" />
      <section className="tab-page">
        <div className="tab-heading"><div><p className="eyebrow">WYLICZENIE</p><h1>Kalkulator świadczeń</h1></div><span className="live">Aktualne dane ZUS</span></div>
        <div className="tab-grid">
          <section className="card calculator-page-card">
            <h2>Parametry sprawy</h2>
            <label>Rodzaj świadczenia
              <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
                {benefits.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
              </select>
            </label>
            <label>Typ zatrudnienia
              <select value={employment} onChange={(e) => setEmployment(e.target.value)}><option>Umowa o pracę</option><option>Umowa zlecenie</option><option>Działalność gospodarcza</option></select>
            </label>
            <label>Miesięczna podstawa (PLN)<input value={basis} onChange={(e) => setBasis(e.target.value)} type="number" min="0" step="100" /></label>
            <button className="primary full" onClick={calculate} disabled={loading || Number(basis) <= 0}>{loading ? "Obliczam…" : "Oblicz uprawnienia"}</button>
            {error && <p className="form-error" role="alert">{error}. Uruchom API na porcie 4000.</p>}
            {result && <div className="result-result" aria-live="polite"><div><small>Szacowana kwota miesięczna</small><strong>{Number(result.monthly).toLocaleString("pl-PL")} zł</strong></div><div><small>Okres świadczenia</small><strong>{result.months} mies.</strong></div><div><small>Łącznie szacunkowo</small><strong>{Number(result.estimatedTotal).toLocaleString("pl-PL")} zł</strong></div></div>}
          </section>
          <section className="card benefits benefit-page-card">
            <div className="card-head"><div><p className="eyebrow">DOSTĘPNE ŚWIADCZENIA</p><h2>Co Ci przysługuje?</h2></div></div>
            {benefits.map(([id, title, amount, color]) => <button key={id} type="button" className={scenario === id ? "selected" : ""} onClick={() => setScenario(id)}><span style={{ background: color }}>{title.slice(0, 1)}</span><div><b>{title}</b><small>{amount}</small></div><i>›</i></button>)}
          </section>
        </div>
      </section>
    </main>
  );
}
