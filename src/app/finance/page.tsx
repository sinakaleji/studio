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
import { collection, serverTimestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useMemoFirebase } from '@/firebase/provider';

const transactionSchema = z.object({
  description: z.string().min(1, 'توضیحات الزامی است'),
  amount: z.coerce.number().min(1, 'مبلغ الزامی است'),
  type: z.enum(['income', 'expense'], { required_error: 'نوع تراکنش الزامی است' }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function FinancePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { firestore } = useFirebase();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'income',
    },
  });

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'financial_transactions');
  }, [firestore]);

  const { data: transactions, isLoading } = useCollection<any>(transactionsQuery);

  const onSubmit = (data: TransactionFormData) => {
    if (!firestore) return;
    const transactionData = {
      ...data,
      date: serverTimestamp(),
    };
    addDocumentNonBlocking(collection(firestore, 'financial_transactions'), transactionData);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <Header title="مدیریت مالی" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>تراکنش‌های مالی</CardTitle>
              <CardDescription>ثبت و مشاهده درآمدها و هزینه‌ها</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              ثبت تراکنش
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>در حال بارگذاری...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>مبلغ (تومان)</TableHead>
                    <TableHead>تاریخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-xs',
                            tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          )}
                        >
                          {tx.type === 'income' ? 'درآمد' : 'هزینه'}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn('font-medium', tx.type === 'income' ? 'text-green-600' : 'text-red-600')}
                      >
                        {tx.amount.toLocaleString('fa-IR')}
                      </TableCell>
                      <TableCell>
                        {tx.date ? new Date(tx.date.seconds * 1000).toLocaleDateString('fa-IR') : '...'}
                      </TableCell>
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
            <DialogTitle>ثبت تراکنش جدید</DialogTitle>
            <DialogDescription>اطلاعات تراکنش جدید را وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع تراکنش</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع تراکنش را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">درآمد</SelectItem>
                        <SelectItem value="expense">هزینه</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مبلغ (تومان)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea placeholder="مثال: پرداخت شارژ ماهانه ویلای A101" {...field} />
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
