"use client";

import Link from "next/link";
import AppHeader from "./components/AppHeader";

export default function Home() {
	return (
		<main id="main-content">
			<AppHeader active="/" />
			<section className="dashboard-layout" aria-labelledby="dashboard-heading">
				<div className="content dashboard-content">
					<header className="hero">
						<div>
							<p className="eyebrow">CENTRUM ZUS</p>
							<h1 id="dashboard-heading">Masz 4 narzędzia do wykorzystania</h1>
							<p>Sprawdź świadczenia, przygotuj dokumenty i porozmawiaj z asystentem ZUS.</p>
						</div>
					</header>

					<nav className="dashboard-grid" aria-label="Narzędzia ZUS Nawigator">
						<Link className="dashboard-card" href="/calculator">
							<span className="card-icon green" aria-hidden="true">%</span>
							<div className="dashboard-card-content">
								<p className="eyebrow">WYLICZENIE</p>
								<h2>Kalkulator świadczeń</h2>
								<p>Porównaj przewidywaną wysokość świadczenia dla różnych sytuacji i rodzajów zatrudnienia.</p>
							</div>
							<span className="dashboard-action">Otwórz kalkulator <span aria-hidden="true">→</span></span>
						</Link>

						<Link className="dashboard-card" href="/documents">
							<span className="card-icon orange" aria-hidden="true">PDF</span>
							<div className="dashboard-card-content">
								<p className="eyebrow">DOKUMENTY</p>
								<h2>Dokumenty i formularze</h2>
								<p>Sprawdź listę wymaganych dokumentów i przygotuj kompletny pakiet formularzy ZUS.</p>
							</div>
							<span className="dashboard-action">Przejdź do dokumentów <span aria-hidden="true">→</span></span>
						</Link>

						<Link className="dashboard-card" href="/asystent">
							<span className="card-icon purple" aria-hidden="true">AI</span>
							<div className="dashboard-card-content">
								<p className="eyebrow">POMOC</p>
								<h2>Asystent ZUS</h2>
								<p>Zadaj pytanie o prawa, terminy, formularze i przygotowanie do rozmowy z ZUS.</p>
							</div>
							<span className="dashboard-action">Porozmawiaj z asystentem <span aria-hidden="true">→</span></span>
						</Link>

						<Link className="dashboard-card" href="/poradnik">
							<span className="card-icon green" aria-hidden="true">PDF</span>
							<div className="dashboard-card-content">
								<p className="eyebrow">PORADNIK ZUS</p>
								<h2>Dla rodziców i opiekunów</h2>
								<p>Najważniejsze zasady ubezpieczeń, świadczeń, urlopów i formalności po narodzinach dziecka.</p>
							</div>
							<span className="dashboard-action">Otwórz poradnik <span aria-hidden="true">→</span></span>
						</Link>
					</nav>
				</div>
			</section>
		</main>
	);
}
