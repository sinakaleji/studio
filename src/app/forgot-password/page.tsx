'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const forgotPasswordSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();
  const { auth } = useFirebase();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSent(true);
    } catch (error) {
      let description = 'مشکلی در ارسال ایمیل بازیابی به وجود آمد.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          description = 'کاربری با این ایمیل یافت نشد.';
        }
      }
      toast({
        variant: 'destructive',
        title: 'خطا',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">بازیابی رمز عبور</CardTitle>
          <CardDescription>
            {isSent
              ? 'ایمیل بازیابی با موفقیت ارسال شد. لطفاً صندوق ورودی (و اسپم) خود را بررسی کنید.'
              : 'ایمیل خود را برای دریافت لینک بازیابی رمز عبور وارد کنید.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ایمیل</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  ارسال لینک بازیابی
                </Button>
              </form>
            </Form>
          ) : (
            <Button asChild className="w-full">
              <Link href="/login">بازگشت به صفحه ورود</Link>
            </Button>
          )}
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              بازگشت به صفحه ورود
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
