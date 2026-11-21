import type { Metadata } from "next";
import "./globals.css";
import AccessibilityTools from "./components/AccessibilityTools";

export const metadata: Metadata = {
  title: "ZUS Nawigator",
  description: "Kalkulator i kreator świadczeń rodzinnych ZUS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <a className="skip-link" href="#main-content">Przejdź do głównej treści</a>
        {children}
        <AccessibilityTools />
      </body>
    </html>
  );
}
