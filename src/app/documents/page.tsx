import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DocumentsPage() {
  return (
    <AppLayout>
      <Header title="مدیریت مدارک" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>در دست ساخت</CardTitle>
                <CardDescription>
                    این بخش برای بارگذاری، مشاهده، حذف و ویرایش مدارک مرتبط با شرکت، طرفین قرارداد و پرسنل در حال توسعه است.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>به زودی امکانات کامل مدیریت اسناد و مدارک در اینجا در دسترس خواهد بود.</p>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
