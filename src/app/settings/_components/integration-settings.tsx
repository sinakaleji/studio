'use client';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDoc, useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const integrationSettingsSchema = z.object({
  kavenegarApiKey: z.string().optional(),
  gmailSmtpHost: z.string().optional(),
  gmailSmtpPort: z.coerce.number().optional(),
  gmailSmtpUser: z.string().optional(),
  gmailSmtpPass: z.string().optional(),
});

type IntegrationSettingsFormData = z.infer<typeof integrationSettingsSchema>;
type IntegrationSettingsData = IntegrationSettingsFormData & { id: string };

const INTEGRATION_SETTINGS_DOC_ID = "default";

export default function IntegrationSettings() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const settingsDocRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'integration_settings', INTEGRATION_SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settingsData, isLoading } = useDoc<IntegrationSettingsData>(settingsDocRef);

  const form = useForm<IntegrationSettingsFormData>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      kavenegarApiKey: '',
      gmailSmtpHost: 'smtp.gmail.com',
      gmailSmtpPort: 587,
      gmailSmtpUser: '',
      gmailSmtpPass: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      form.reset(settingsData);
    }
  }, [settingsData, form]);

  const onSubmit = (data: IntegrationSettingsFormData) => {
    if (!firestore) return;
    setDocumentNonBlocking(doc(firestore, 'integration_settings', INTEGRATION_SETTINGS_DOC_ID), data, { merge: true });
    toast({
      title: 'موفقیت‌آمیز',
      description: 'تنظیمات یکپارچه‌سازی با موفقیت ذخیره شد.',
    });
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        
        <Card>
            <CardHeader>
                <CardTitle>سرویس پیامک (کاوه‌نگار)</CardTitle>
                <CardDescription>API Key مربوط به سرویس کاوه‌نگار را برای فعال‌سازی ثبت‌نام با شماره موبایل وارد کنید.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                control={form.control}
                name="kavenegarApiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Kavenegar API Key</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••••••••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>سرویس ایمیل (Gmail SMTP)</CardTitle>
                <CardDescription>اطلاعات سرور SMTP برای ارسال ایمیل‌های ثبت‌نام و اطلاع‌رسانی.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="gmailSmtpHost" render={({ field }) => (
                        <FormItem><FormLabel>SMTP Host</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="gmailSmtpPort" render={({ field }) => (
                        <FormItem><FormLabel>SMTP Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="gmailSmtpUser" render={({ field }) => (
                    <FormItem><FormLabel>نام کاربری (ایمیل)</FormLabel><FormControl><Input placeholder="example@gmail.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="gmailSmtpPass" render={({ field }) => (
                    <FormItem><FormLabel>رمز عبور (App Password)</FormLabel><FormControl><Input type="password" placeholder="••••••••••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </CardContent>
        </Card>
        
        <Button type="submit">ذخیره تغییرات</Button>
      </form>
    </Form>
  );
}
