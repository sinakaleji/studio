'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemoFirebase } from '@/firebase/provider';

const villaSchema = z.object({
  villaNumber: z.string().min(1, 'شماره ویلا الزامی است'),
  location: z.string().min(1, 'موقعیت الزامی است'),
  size: z.coerce.number().min(1, 'متراژ الزامی است'),
  ownerName: z.string().min(1, 'نام مالک الزامی است'),
});

type VillaFormData = z.infer<typeof villaSchema>;

export default function VillasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { firestore, user } = useFirebase();

  const form = useForm<VillaFormData>({
    resolver: zodResolver(villaSchema),
    defaultValues: {
      villaNumber: '',
      location: '',
      size: 0,
      ownerName: '',
    },
  });

  const villasQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'villas');
  }, [firestore]);

  const { data: villas, isLoading } = useCollection<any>(villasQuery);

  const onSubmit = (data: VillaFormData) => {
    if (!firestore || !user) return;
    const villaData = {
      ...data,
      ownerId: user.uid, // Assign current user as owner
    };
    addDocumentNonBlocking(collection(firestore, 'villas'), villaData);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <Header title="مدیریت ویلاها" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>لیست ویلاها</CardTitle>
              <CardDescription>مشاهده و مدیریت ویلاهای ثبت شده در شهرک</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن ویلا
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>در حال بارگذاری...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره ویلا</TableHead>
                    <TableHead>موقعیت</TableHead>
                    <TableHead>متراژ (متر مربع)</TableHead>
                    <TableHead>مالک</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {villas?.map((villa) => (
                    <TableRow key={villa.id}>
                      <TableCell>
                        <Badge>{villa.villaNumber}</Badge>
                      </TableCell>
                      <TableCell>{villa.location}</TableCell>
                      <TableCell>{villa.size}</TableCell>
                      <TableCell>{villa.ownerName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>افزودن ویلای جدید</DialogTitle>
            <DialogDescription>اطلاعات ویلای جدید را وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="villaNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره ویلا</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: A101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>موقعیت</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: فاز ۱، خیابان یاس" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>متراژ (متر مربع)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 300" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام مالک</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: علی رضایی" {...field} />
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
