import { siteInfo } from '@/app/lib/constants';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: `Browse the portfolio of ${siteInfo.name}.`,
};

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
