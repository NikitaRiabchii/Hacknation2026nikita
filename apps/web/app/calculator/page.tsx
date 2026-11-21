"use client";

import { useState } from "react";
import AppHeader from "../components/AppHeader";

const benefits = [
  ["sickness", "Zasiłek chorobowy", "100% podstawy", "#19a974"],
  ["maternity", "Urlop i zasiłek macierzyński", "20–37 tygodni", "#ef8b6c"],
  ["parental", "Urlop i zasiłek rodzicielski", "41–67 tygodni", "#6f67c9"],
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
  const [children, setChildren] = useState("1");
  const [enhancedCertificate, setEnhancedCertificate] = useState(false);
  const [benefitRate, setBenefitRate] = useState("81.5");
  const [sicknessReason, setSicknessReason] = useState("ordinary");
  const [hospitalWeeks, setHospitalWeeks] = useState("0");
  const [childWeeksAfterBirth, setChildWeeksAfterBirth] = useState("0");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    setLoading(true); setError("");
    try {
      const response = await fetch("http://localhost:4000/api/calculator/calculate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, basis: Number(basis), employmentType: employment, documents: ["ZAM", "ZUS ZLA"], startDate: "2026-04-15", children: Number(children), enhancedCertificate, benefitRate, sicknessReason, hospitalWeeks: Number(hospitalWeeks), childWeeksAfterBirth: Number(childWeeksAfterBirth) }),
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
            {(scenario === "maternity" || scenario === "parental" || scenario === "adoption" || scenario === "foster") && (
              <label>Wariant stawki świadczenia
                <select value={benefitRate} onChange={(e) => setBenefitRate(e.target.value)}><option value="81.5">81,5% podstawy wymiaru</option><option value="70">70% podstawy wymiaru</option><option value="100">100% podstawy wymiaru</option></select>
              </label>
            )}
            {(scenario === "maternity" || scenario === "adoption" || scenario === "foster") && (
              <label>Liczba dzieci przy jednym porodzie / przyjęciu
                <input value={children} onChange={(e) => setChildren(e.target.value)} type="number" min="1" max="5" />
              </label>
            )}
            {scenario === "parental" && (
              <label className="check legal-checkbox"><input type="checkbox" checked={enhancedCertificate} onChange={(e) => setEnhancedCertificate(e.target.checked)} /><span>{enhancedCertificate ? "✓" : ""}</span><div><b>Zaświadczenie „Za życiem”</b><small>Wydłuża urlop rodzicielski do 65/67 tygodni</small></div></label>
            )}
            {scenario === "sickness" && (
              <label>Powód niezdolności
                <select value={sicknessReason} onChange={(e) => setSicknessReason(e.target.value)}><option value="ordinary">Zwykła choroba</option><option value="pregnancy">Choroba przypadająca w ciąży</option><option value="commute">Wypadek w drodze do pracy lub z pracy</option></select>
              </label>
            )}
            {scenario === "premature" && (
              <label>Tygodnie pobytu dziecka w szpitalu
                <input value={hospitalWeeks} onChange={(e) => setHospitalWeeks(e.target.value)} type="number" min="0" step="1" />
              </label>
            )}
            {scenario === "death" && (
              <label>Tygodnie życia dziecka po porodzie
                <input value={childWeeksAfterBirth} onChange={(e) => setChildWeeksAfterBirth(e.target.value)} type="number" min="0" />
              </label>
            )}
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
