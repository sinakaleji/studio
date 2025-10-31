import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VillasPage() {
  return (
    <AppLayout>
      <Header title="مدیریت ویلاها" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>در دست ساخت</CardTitle>
                <CardDescription>
                    این بخش برای مدیریت ویلاها، ثبت اطلاعات آنها و نمایش روی نقشه گرافیکی در حال آماده‌سازی است.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>به زودی امکانات کامل مدیریت ویلاها در اینجا در دسترس خواهد بود.</p>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
