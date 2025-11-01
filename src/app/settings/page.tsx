'use client';
import React from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EstateSettings from './_components/estate-settings';
import PayrollSettings from './_components/payroll-settings';
import IntegrationSettings from './_components/integration-settings';
import { useUser } from '@/firebase';


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  // We need to fetch the user's role from the user document in firestore
  // For now, let's assume we have a way to get the role.
  // This is a simplified check. In a real app you'd fetch the user's profile.
  const userRole = 'super_admin'; // Placeholder, replace with actual role fetching

  return (
    <AppLayout>
      <Header title="تنظیمات" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="estate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
            <TabsTrigger value="estate">اطلاعات شهرک</TabsTrigger>
            <TabsTrigger value="payroll">تنظیمات حقوق و دستمزد</TabsTrigger>
             {userRole === 'super_admin' && (
               <TabsTrigger value="integrations">یکپارچه‌سازی</TabsTrigger>
             )}
          </TabsList>
          <TabsContent value="estate">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات شهرک</CardTitle>
                <CardDescription>اطلاعات کلی شهرک را در این بخش مدیریت کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                <EstateSettings />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payroll">
             <Card>
              <CardHeader>
                <CardTitle>تنظیمات حقوق و دستمزد</CardTitle>
                <CardDescription>
                    قوانین محاسبه حقوق مانند نرخ بیمه و پلکان‌های مالیاتی را مدیریت کنید.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <PayrollSettings />
              </CardContent>
            </Card>
          </TabsContent>
          {userRole === 'super_admin' && (
            <TabsContent value="integrations">
                <Card>
                    <CardHeader>
                        <CardTitle>تنظیمات یکپارچه‌سازی</CardTitle>
                        <CardDescription>
                            API Key و اطلاعات مربوط به سرویس‌های خارجی مانند ایمیل و پیامک را مدیریت کنید.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <IntegrationSettings />
                    </CardContent>
                </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </AppLayout>
  );
}
