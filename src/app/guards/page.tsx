
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { getPersonnel } from "@/lib/data-manager";
import type { Personnel } from "@/lib/types";
import ShiftScheduler from "./_components/shift-scheduler";

export default function GuardsPage() {
  const [guards, setGuards] = useState<Personnel[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const allPersonnel = getPersonnel();
    setGuards(allPersonnel.filter(p => p.role === 'نگهبان'));
  }, []);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="شیفت نگهبانان" />
      <ShiftScheduler guards={guards} />
    </main>
  );
}
