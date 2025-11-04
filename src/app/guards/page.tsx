import PageHeader from "@/components/page-header";
import ShiftScheduler from "./_components/shift-scheduler";
import { mockPersonnel } from "@/lib/data";

export default function GuardsPage() {
  const guards = mockPersonnel.filter(p => p.role === 'نگهبان');

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="مدیریت شیفت نگهبانان" />
      <ShiftScheduler guards={guards} />
    </main>
  );
}
