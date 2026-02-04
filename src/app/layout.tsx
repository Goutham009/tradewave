import type { Metadata } from 'next';
import { Manrope, Poppins } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/variables.css';
import '@/styles/animations.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { SocketProvider } from '@/providers/SocketProvider';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

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
      <body className={`${poppins.variable} ${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
