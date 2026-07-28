import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayran Gurmesi | İçtiğin Ayranları Keşfet ve Sırala",
  description: "Bugüne kadar içtiğiniz ayranları kaydedebileceğiniz, puanlayabileceğiniz ve kolayca listeleyebileceğiniz modern ayran günlüğü.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
