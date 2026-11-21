"use client";

import { useEffect, useState } from "react";

type DisplayMode = "normal" | "contrast" | "dyslexia";

export default function AccessibilityTools() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === "undefined") return 100;
    const saved = Number(window.localStorage.getItem("zus-font-size") ?? 100);
    return saved >= 90 && saved <= 125 ? saved : 100;
  });
  const [mode, setMode] = useState<DisplayMode>(() => {
    if (typeof window === "undefined") return "normal";
    const saved = window.localStorage.getItem("zus-display-mode") as DisplayMode | null;
    return saved === "contrast" || saved === "dyslexia" ? saved : "normal";
  });
  const [speechAvailable] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--accessibility-scale", `${fontSize / 100}`);
    document.documentElement.classList.remove("a11y-contrast", "a11y-dyslexia");
    if (mode === "contrast") document.documentElement.classList.add("a11y-contrast");
    if (mode === "dyslexia") document.documentElement.classList.add("a11y-dyslexia");
    window.localStorage.setItem("zus-font-size", String(fontSize));
    window.localStorage.setItem("zus-display-mode", mode);
  }, [fontSize, mode]);

  function speakPage() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const main = document.querySelector("main");
    const text = main?.innerText.slice(0, 5000) ?? "";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <>
      <button
        className="a11y-trigger"
        type="button"
        aria-label="Otwórz narzędzia dostępności"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">A</span>
      </button>

      {open && (
        <aside className="a11y-panel" id="a11y-panel" aria-label="Narzędzia dostępności">
          <div className="a11y-heading">
            <div><span>DOSTĘPNOŚĆ</span><b>Ustawienia wyświetlania</b></div>
            <button type="button" aria-label="Zamknij narzędzia dostępności" onClick={() => setOpen(false)}>×</button>
          </div>

          <fieldset>
            <legend>Rozmiar tekstu</legend>
            <div className="a11y-font-controls">
              <button type="button" disabled={fontSize <= 90} onClick={() => setFontSize((value) => Math.max(90, value - 5))} aria-label="Zmniejsz tekst">A−</button>
              <output aria-live="polite">{fontSize}%</output>
              <button type="button" disabled={fontSize >= 125} onClick={() => setFontSize((value) => Math.min(125, value + 5))} aria-label="Powiększ tekst">A+</button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Tryb widzenia</legend>
            <div className="a11y-mode-controls">
              <button type="button" className={mode === "normal" ? "selected" : ""} aria-pressed={mode === "normal"} onClick={() => setMode("normal")}>Standardowy</button>
              <button type="button" className={mode === "contrast" ? "selected" : ""} aria-pressed={mode === "contrast"} onClick={() => setMode("contrast")}>Wysoki kontrast</button>
              <button type="button" className={mode === "dyslexia" ? "selected" : ""} aria-pressed={mode === "dyslexia"} onClick={() => setMode("dyslexia")}>Tekst komfortowy</button>
            </div>
          </fieldset>

          {speechAvailable && (
            <button className="a11y-speech" type="button" aria-pressed={speaking} onClick={speakPage}>
              <span aria-hidden="true">◉</span>{speaking ? "Zatrzymaj czytanie strony" : "Czytaj stronę po polsku"}
            </button>
          )}

          <button
            className="a11y-reset"
            type="button"
            onClick={() => { setFontSize(100); setMode("normal"); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); setSpeaking(false); }}
          >Przywróć ustawienia domyślne</button>
        </aside>
      )}
    </>
  );
}
