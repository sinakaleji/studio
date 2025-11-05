
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/page-header";
import { getPersonnel } from "@/lib/data-manager";
import type { Personnel } from "@/lib/types";
import { Loader2 } from "lucide-react";

// Dynamically import the ShiftScheduler component with SSR disabled
const ShiftScheduler = dynamic(() => import("./_components/shift-scheduler"), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export default function GuardsPage() {
  const [guards, setGuards] = useState<Personnel[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect will run on the client side
    const allPersonnel = getPersonnel();
    const guardPersonnel = allPersonnel.filter(p => p.role === 'نگهبان');
    const validGuards = guardPersonnel.filter(g => `${g.firstName} ${g.lastName}`.trim() !== '');
    setGuards(validGuards);
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <PageHeader title="شیفت نگهبانان" />
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="شیفت نگهبانان" />
      <ShiftScheduler guards={guards} />
    </main>
  );
}

    