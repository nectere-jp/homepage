import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Nectere - テクノロジーに、人間らしさを取り戻す。',
  description: 'Nectereは、翻訳・ホームページ制作・印刷物制作を通じて、テクノロジーと人間の架け橋となることを目指しています。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
