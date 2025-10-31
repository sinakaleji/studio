import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FinancePage() {
  return (
    <AppLayout>
      <Header title="مدیریت مالی" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>در دست ساخت</CardTitle>
                <CardDescription>
                    این بخش برای مدیریت امور مالی، شامل دریافتی‌ها، پرداختی‌ها، و سیستم حقوق و دستمزد در حال آماده‌سازی است.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>به زودی امکانات کامل مدیریت مالی طبق استانداردهای ایران در اینجا در دسترس خواهد بود.</p>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
