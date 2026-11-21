"use client";

import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";

type GuideSection = { title: string; text: string };

export default function GuidePage() {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("http://localhost:4000/api/guide/summary")
      .then((response) => { if (!response.ok) throw new Error("Nie udało się pobrać informacji o poradniku"); return response.json(); })
      .then((data) => { if (active) setSections(data.sections ?? []); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main>
      <AppHeader active="/poradnik" />
      <section className="tab-page guide-page">
        <div className="tab-heading">
          <div><p className="eyebrow">PORADNIK ZUS 2026</p><h1>Dla rodziców i opiekunów</h1></div>
          <a className="primary guide-download" href="http://localhost:4000/api/guide/download">Pobierz książkę PDF</a>
        </div>

        <section className="guide-hero card">
          <div className="guide-book"><span>ZUS</span><small>PORADNIK 2026</small></div>
          <div><p className="eyebrow">CO WARTO WIEDZIEĆ</p><h2>Rodzicielstwo bez chaosu formalnego</h2><p>Przejrzysty przewodnik po ubezpieczeniach, urlopach, zasiłkach macierzyńskich i opiekuńczych oraz sytuacjach szczególnych.</p></div>
        </section>

        {loading && <p className="guide-status" aria-live="polite">Wczytywanie najważniejszych tematów…</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="guide-grid">
          {sections.map((section, index) => (
            <article className="card guide-card" key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </div>

        <section className="guide-links card">
          <h2>Potrzebujesz szybkiej pomocy?</h2>
          <div>
            <a href="https://www.zus.pl/" target="_blank" rel="noopener noreferrer">Portal ZUS →</a>
            <a href="https://www.zus.pl/e-wizyta" target="_blank" rel="noopener noreferrer">Umów e-wizytę →</a>
            <a href="tel:+48225601600">Infolinia: 22 560 16 00</a>
            <a href="mailto:mama@zus.pl">mama@zus.pl</a>
          </div>
        </section>
      </section>
    </main>
  );
}
