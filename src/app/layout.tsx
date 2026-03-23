import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ImmoCalc – Immobilien Investment Rechner',
  description: 'Rentabilitätsrechner für Immobilieninvestments: Cashflow, Rendite, Tilgungsplan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
