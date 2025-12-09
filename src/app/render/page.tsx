"use client";

import React, { useEffect, useState } from 'react';
import { ProjectData, SlideData } from '@/types';
import { CardNewsV1 } from '@/components/Templates/CardNewsV1';

// Match the merged data structure sent by route.ts
type RenderData = SlideData & Partial<ProjectData>;

export default function RenderPage() {
  const [data, setData] = useState<RenderData | null>(null);

  useEffect(() => {
    // Expose setter to window for Puppeteer
    (window as any).setCardData = (newData: RenderData) => {
      setData(newData);
    };
    
    // Signal readiness
    (window as any).isRenderReady = true;
  }, []);

  if (!data) return <div className="text-white">Waiting for data...</div>;

  return (
    <div style={{ width: 1080, height: 1350 }}>
      <CardNewsV1 data={data} />
    </div>
  );
}
