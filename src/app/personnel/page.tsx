import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PersonnelPage() {
  return (
    <AppLayout>
      <Header title="مدیریت پرسنل" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>در دست ساخت</CardTitle>
                <CardDescription>
                    این بخش برای مدیریت اطلاعات کامل پرسنل، از جمله اطلاعات تماس، شخصی، مدارک و سوابق مالی در حال توسعه است.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>به زودی امکانات کامل مدیریت پرسنل و ماژول حضور و غیاب در اینجا در دسترس خواهد بود.</p>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
