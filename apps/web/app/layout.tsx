import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZUS Nawigator",
  description: "Kalkulator i kreator świadczeń rodzinnych ZUS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}
