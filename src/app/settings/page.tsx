'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EstateSettings from './_components/estate-settings';
import PayrollSettings from './_components/payroll-settings';
import IntegrationSettings from './_components/integration-settings';
import { useUser, useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && firestore) {
        setIsLoadingRole(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data().roleId);
        }
        setIsLoadingRole(false);
      } else if (!isUserLoading) {
        setIsLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [user, firestore, isUserLoading]);
  
  const isSuperAdmin = userRole === 'super_admin';

  if (isLoadingRole) {
    return (
      <AppLayout>
        <Header title="تنظیمات" />
        <main className="flex flex-1 items-center justify-center">
            <p>در حال بارگذاری تنظیمات...</p>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header title="تنظیمات" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="estate" className="w-full">
          <TabsList className={`grid w-full max-w-lg mx-auto ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="estate">اطلاعات شهرک</TabsTrigger>
            <TabsTrigger value="payroll">تنظیمات حقوق و دستمزد</TabsTrigger>
             {isSuperAdmin && (
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
          {isSuperAdmin && (
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
