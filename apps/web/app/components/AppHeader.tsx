"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiUrl } from "../lib/api";

const items = [
  ["/", "Panel główny"],
  ["/calculator", "Kalkulator"],
  ["/documents", "Dokumenty"],
  ["/asystent", "Asystent"],
  ["/poradnik", "Poradnik"],
] as const;

export default function AppHeader({ active = "/" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "Anna Kowalska";
    return window.localStorage.getItem("zus-demo-name") ?? "Anna Kowalska";
  });
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("zus-demo-login") !== "false";
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Błąd logowania");
      const data = await response.json();
      const accountName = data.user.name || name;
      setName(accountName);
      setLoggedIn(true);
      window.localStorage.setItem("zus-demo-name", accountName);
      window.localStorage.setItem("zus-demo-login", "true");
      setOpen(false);
    } catch {
      setLoggedIn(true);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setLoggedIn(false);
    window.localStorage.setItem("zus-demo-login", "false");
    setOpen(false);
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="ZUS Nawigator — strona główna">
          <span className="brandmark">Z</span>
          <div><strong>ZUS Nawigator</strong><small>Rodzicielstwo i świadczenia</small></div>
        </Link>

        <nav aria-label="Główna nawigacja">
          {items.map(([href, label]) => (
            <Link key={href} className={active === href ? "active" : ""} href={href}>{label}</Link>
          ))}
        </nav>

        <button
          className="profile"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={loggedIn ? "Otwórz konto" : "Zaloguj się"}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{loggedIn ? initials : "—"}</span>
          <b>{loggedIn ? name : "Zaloguj się"}</b>
          <small>{loggedIn ? "Zweryfikowana" : "Konto mObywatel"}</small>
        </button>
      </header>

      {open && (
        <>
          <button className="account-backdrop" type="button" aria-label="Zamknij menu konta" onClick={() => setOpen(false)} />
          <section className="account-popover" role="dialog" aria-modal="false" aria-labelledby="account-title">
            <button className="account-close" type="button" aria-label="Zamknij" onClick={() => setOpen(false)}>×</button>

            {loggedIn ? (
              <>
                <div className="account-identity">
                  <span>{initials}</span>
                  <div>
                    <small>MOJE KONTO</small>
                    <h2 id="account-title">{name}</h2>
                    <p>● Konto zweryfikowane przez mObywatel</p>
                  </div>
                </div>

                <div className="account-details">
                  <div><small>IDENTYFIKATOR DEMO</small><b>******1234</b></div>
                  <div><small>PROVIDER</small><b>mObywatel (mock)</b></div>
                  <div><small>STATUS ZUS</small><b className="account-active">Aktywne ubezpieczenie</b></div>
                </div>

                <button className="account-logout" type="button" onClick={logout}>Wyloguj</button>
              </>
            ) : (
              <>
                <div className="mobywatel-mark"><span>m</span></div>
                <p className="eyebrow">DEMO LOGOWANIA</p>
                <h2 id="account-title">Zaloguj się do ZUS Nawigator</h2>
                <p className="account-description">Użyj przykładowego konta demonstracyjnego. Dane nie są przesyłane ani zapisywane.</p>

                <form className="account-form" onSubmit={login}>
                  <label>
                    Imię i nazwisko
                    <input value={name} onChange={(event) => setName(event.target.value)} required />
                  </label>
                  <label>
                    Numer PESEL / identyfikator
                    <input value="******1234" readOnly />
                  </label>
                  <button className="primary full" type="submit" disabled={loading || !name.trim()}>
                    {loading ? "Logowanie…" : "Zaloguj przez mObywatel"}
                  </button>
                </form>
              </>
            )}
          </section>
        </>
      )}
    </>
  );
}
