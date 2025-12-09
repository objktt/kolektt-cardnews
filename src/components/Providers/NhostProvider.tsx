'use client';

import { NhostProvider as NhostNextProvider } from '@nhost/nextjs';
import { nhost } from '@/utils/nhost';

export function NhostProvider({ children }: { children: React.ReactNode }) {
  return (
    <NhostNextProvider nhost={nhost}>
      {children}
    </NhostNextProvider>
  );
}
