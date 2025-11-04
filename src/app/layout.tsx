import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import LayoutProvider from '@/components/layout-provider';

export const metadata: Metadata = {
  title: 'Nilarose Community',
  description: 'Nilarose Community Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
      </head>
      <body className="font-body antialiased">
        <LayoutProvider>{children}</LayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
