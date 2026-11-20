import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EditingCation — PeakCut Studio Video Caption & Layout Editor',
  description: 'Browser-based 100% client-side video captions, layout compositor, and subtitle editor. Zero server latency, Vercel-ready.',
  icons: {
    icon: '/brand/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-[#090a0f] text-gray-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
