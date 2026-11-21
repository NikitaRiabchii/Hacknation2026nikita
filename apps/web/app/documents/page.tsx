"use client";

import { DragEvent, ChangeEvent, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";

const documents = [
  "WNIOSEK ZAM — zasiłek macierzyński",
  "ZUS ZLA — zaświadczenie lekarskie",
  "Zaświadczenie o urodzeniu / pobycie dziecka w szpitalu",
  "Dokumenty zatrudnienia i podstawy wymiaru",
];

function findDocumentIndex(fileName: string): number {
  const name = fileName.toLowerCase();
  if (name.includes("zam")) return 0;
  if (name.includes("zla") || name.includes("l4") || name.includes("lekars")) return 1;
  if (name.includes("urod") || name.includes("szpital") || name.includes("porod")) return 2;
  if (name.includes("pracodaw") || name.includes("wynagrod") || name.includes("zatrud") || name.includes("pit") || name.includes("podstawa")) return 3;
  return -1;
}

export default function DocumentsPage() {
  const [checked, setChecked] = useState([false, false, false, false]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileMessage, setFileMessage] = useState("Nie dodano jeszcze żadnych dokumentów.");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function generateBundle() {
    setLoading(true);
    setMessage("");
    try {
      const selectedDocuments = documents.filter((_, index) => checked[index]);
      const response = await fetch("http://localhost:4000/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: selectedDocuments }),
      });
      if (!response.ok) throw new Error("Nie udało się przygotować pakietu");
      const data = await response.json();
      setMessage(`Pakiet ${data.bundleName} jest gotowy do pobrania.`);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setLoading(false);
    }
  }

  async function validateFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    if (incoming.length === 0) return;

    const valid: File[] = [];
    const problems: string[] = [];

    for (const file of incoming) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        problems.push(`${file.name}: wymagany format PDF`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        problems.push(`${file.name}: plik przekracza 10 MB`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      const names = valid.map((file) => file.name);
      setFileNames((current) => [...current, ...names]);

      const nextChecked = [...checked];
      const recognized: string[] = [];
      const unknown: string[] = [];

      for (const file of valid) {
        const index = findDocumentIndex(file.name);
        if (index >= 0) {
          nextChecked[index] = true;
          recognized.push(documents[index]);

          try {
            await fetch("http://localhost:4000/api/documents/parse", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName: file.name }),
            });
          } catch {
            // Parser is optional in the local demo; filename validation remains active.
          }
        } else {
          unknown.push(file.name);
        }
      }

      setChecked(nextChecked);

      const validMessage = recognized.length
        ? `Rozpoznano i zaznaczono: ${recognized.join(", ")}.`
        : "Pliki PDF są poprawne, ale ich nazwy nie pozwoliły przypisać ich automatycznie do dokumentów.";
      setFileMessage([validMessage, unknown.length ? `Nieprzypisane: ${unknown.join(", ")}.` : "", problems.join(". ")].filter(Boolean).join("\n"));
    } else if (problems.length > 0) {
      setFileMessage(problems.join("\n"));
    }

    if (fileInput.current) fileInput.current.value = "";
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void validateFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void validateFiles(event.dataTransfer.files);
  }

  const progress = Math.round((checked.filter(Boolean).length / checked.length) * 100);

  return (
    <main>
      <AppHeader active="/documents" />
      <section className="tab-page">
        <div className="tab-heading">
          <div><p className="eyebrow">DOCUMENTS</p><h1>Dokumenty i formularze</h1></div>
          <b className="completion">{progress}% gotowe</b>
        </div>

        <div className="documents-progress" role="progressbar" aria-label="Kompletność dokumentów" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="tab-grid documents-grid">
          <section className="card document-list-card">
            <h2>Lista kontrolna</h2>
            {documents.map((doc, i) => (
              <label key={doc} className="check">
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => setChecked((current) => current.map((value, index) => index === i ? !value : value))}
                />
                <span>{checked[i] ? "✓" : ""}</span>
                <div><b>{doc}</b><small>{checked[i] ? "Gotowe" : "Wymaga uzupełnienia"}</small></div>
              </label>
            ))}

            <button
              className="primary full"
              type="button"
              onClick={generateBundle}
              disabled={loading || progress !== 100}
            >
              {loading ? "Przygotowywanie…" : progress === 100 ? "Generuj pakiet ZAM / ZUR3 / ZAO4" : `Uzupełnij dokumenty (${progress}%)`}
            </button>
            {message && <p className="form-message" aria-live="polite">{message}</p>}
          </section>

          <section className="card upload-card">
            <p className="eyebrow">PARSER PDF</p>
            <h2>Dodaj dokument</h2>
            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span>PDF</span>
              <b>Przeciągnij pliki lub wybierz je z dysku</b>
              <small>Obsługiwane: PDF, maks. 10 MB na plik</small>
              <input ref={fileInput} type="file" accept="application/pdf,.pdf" multiple hidden onChange={handleFileInput} />
              <button className="outline" type="button" onClick={() => fileInput.current?.click()}>Wybierz pliki</button>
            </div>

            <div className="file-validation" aria-live="polite">
              {fileNames.length > 0 && (
                <div className="validated-files">
                  <small>DODANE PLIKI</small>
                  {fileNames.map((name) => <span key={name}>{name}</span>)}
                </div>
              )}
              <p>{fileMessage}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
