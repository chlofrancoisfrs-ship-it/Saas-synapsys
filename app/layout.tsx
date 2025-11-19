import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synapsys - Plateforme SaaS pour Infopreneurs",
  description: "Centralisez toutes vos données business et optimisez votre temps pour générer du cash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
