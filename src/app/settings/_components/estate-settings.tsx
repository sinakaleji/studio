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

const estateSchema = z.object({
  name: z.string().min(1, 'نام شهرک الزامی است'),
  address: z.string().min(1, 'آدرس الزامی است'),
  contactNumber: z.string().optional(),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
});

type EstateFormData = z.infer<typeof estateSchema>;
type EstateData = EstateFormData & { id: string };

const ESTATE_DOC_ID = "main-estate-info";

export default function EstateSettings() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const estateDocRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'estates', ESTATE_DOC_ID);
  }, [firestore]);

  const { data: estateData, isLoading } = useDoc<EstateData>(estateDocRef);

  const form = useForm<EstateFormData>({
    resolver: zodResolver(estateSchema),
    defaultValues: {
      name: '',
      address: '',
      contactNumber: '',
      email: '',
    },
  });

  useEffect(() => {
    if (estateData) {
      form.reset(estateData);
    }
  }, [estateData, form]);

  const onSubmit = (data: EstateFormData) => {
    if (!firestore) return;
    setDocumentNonBlocking(doc(firestore, 'estates', ESTATE_DOC_ID), data, { merge: true });
    toast({
      title: 'موفقیت‌آمیز',
      description: 'تنظیمات با موفقیت ذخیره شد.',
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام شهرک</FormLabel>
              <FormControl>
                <Input placeholder="مثال: شهرک سینا" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>آدرس</FormLabel>
              <FormControl>
                <Input placeholder="مثال: تهران،..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شماره تماس</FormLabel>
              <FormControl>
                <Input placeholder="مثال: 02188888888" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input placeholder="مثال: info@estate.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">ذخیره تغییرات</Button>
      </form>
    </Form>
  );
}
