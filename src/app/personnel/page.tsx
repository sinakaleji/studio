'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCollection, useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemoFirebase } from '@/firebase/provider';

const personnelSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  jobTitle: z.string().min(1, 'سمت شغلی الزامی است'),
  contactNumber: z.string().optional(),
});

type PersonnelFormData = z.infer<typeof personnelSchema>;

export default function PersonnelPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { firestore } = useFirebase();

  const form = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      contactNumber: '',
    },
  });

  const personnelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'personnel');
  }, [firestore]);

  const { data: personnel, isLoading } = useCollection<any>(personnelQuery);

  const onSubmit = (data: PersonnelFormData) => {
    if (!firestore) return;
    addDocumentNonBlocking(collection(firestore, 'personnel'), data);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <Header title="مدیریت پرسنل" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>لیست پرسنل</CardTitle>
              <CardDescription>مشاهده و مدیریت پرسنل فعال در شهرک</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن پرسنل
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>در حال بارگذاری...</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {personnel?.map((p) => (
                  <Card key={p.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {p.firstName?.charAt(0)}
                          {p.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{`${p.firstName} ${p.lastName}`}</CardTitle>
                        <CardDescription>{p.jobTitle}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="ml-1 h-4 w-4" />
                        <span>{p.contactNumber || 'شماره تماس ثبت نشده'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>افزودن پرسنل جدید</DialogTitle>
            <DialogDescription>اطلاعات پرسنل جدید را وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: محمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: کریمی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سمت شغلی</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: نگهبان" {...field} />
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
                    <FormLabel>شماره تماس (اختیاری)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 09123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    انصراف
                  </Button>
                </DialogClose>
                <Button type="submit">ذخیره</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
