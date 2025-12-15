import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/variables.css';
import '@/styles/animations.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Tradewave - B2B Trade & Logistics Platform',
  description: 'Boutique B2B trade and logistics platform with blockchain-powered transparency and escrow payments.',
  keywords: ['B2B', 'trade', 'logistics', 'blockchain', 'escrow', 'supply chain'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
