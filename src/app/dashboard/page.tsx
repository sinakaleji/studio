'use client';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import OverviewCards from '@/components/dashboard/overview-cards';
import FinancialChart from '@/components/dashboard/financial-chart';
import RecentActivity from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  return (
    <AppLayout>
      <Header title="داشبورد" />
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCards />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <div className="col-span-1 lg:col-span-4">
            <FinancialChart />
          </div>
          <div className="col-span-1 lg:col-span-3">
             <div className="grid gap-4">
                <RecentActivity />
             </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
