import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Campeonato Intermunicipal 2026',
  description: 'Aplicativo oficial de acompanhamento e simulação do Campeonato Intermunicipal de Futebol Amador da Bahia.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Inter2026',
    statusBarStyle: 'black-translucent',
    capable: true,
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased flex min-h-screen bg-[#0f172a] overflow-x-hidden w-full">
        <Sidebar />
        <main className="flex-1 lg:ml-64 w-full p-4 pb-20 lg:pb-8 md:p-8 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
