'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save } from 'lucide-react';
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
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';

const payrollSchema = z.object({
  personnelId: z.string().min(1, 'انتخاب پرسنل الزامی است'),
  salary: z.coerce.number().min(0, 'حقوق پایه الزامی است'),
  deductions: z.coerce.number().min(0, 'کسورات الزامی است'),
  overtimeHours: z.coerce.number().min(0, 'ساعات اضافه کاری الزامی است'),
});

type PayrollFormData = z.infer<typeof payrollSchema>;
type Personnel = { id: string; firstName: string; lastName: string; jobTitle: string; };
type Payroll = PayrollFormData & { id: string; payDate: any; netPay: number; personnelName?: string };

const OVERTIME_RATE = 1.4; // ضریب اضافه کاری طبق قانون کار

export default function PayrollPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      personnelId: '',
      salary: 0,
      deductions: 0,
      overtimeHours: 0,
    },
  });

  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, [firestore]);
  const { data: personnel, isLoading: isLoadingPersonnel } = useCollection<Personnel>(personnelQuery);

  const payrollsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'payrolls') : null, [firestore]);
  const { data: payrolls, isLoading: isLoadingPayrolls } = useCollection<Payroll>(payrollsQuery);

  const personnelMap = useMemoFirebase(() => {
    if (!personnel) return new Map();
    return new Map(personnel.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
  }, [personnel]);
  
  const payrollsWithNames = useMemoFirebase(() => {
      return payrolls?.map(p => ({
          ...p,
          personnelName: personnelMap.get(p.personnelId) || 'نامشخص'
      })) ?? [];
  }, [payrolls, personnelMap]);


  const calculateNetPay = (salary: number, overtimeHours: number, deductions: number): number => {
    const hourlyRate = salary / 192; // ساعات کاری ماهانه
    const overtimePay = overtimeHours * hourlyRate * OVERTIME_RATE;
    const netPay = salary + overtimePay - deductions;
    return Math.max(0, netPay);
  };

  const onSubmit = (data: PayrollFormData) => {
    if (!firestore) return;

    const netPay = calculateNetPay(data.salary, data.overtimeHours, data.deductions);
    
    const payrollData = {
      ...data,
      netPay,
      payDate: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(firestore, 'payrolls'), payrollData);
    toast({
      title: 'موفقیت‌آمیز',
      description: 'فیش حقوقی جدید با موفقیت ثبت شد.',
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <Header title="حقوق و دستمزد" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>لیست حقوق و دستمزد</CardTitle>
              <CardDescription>ثبت و مشاهده فیش‌های حقوقی پرسنل</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} disabled={isLoadingPersonnel}>
              <PlusCircle className="ml-2 h-4 w-4" />
              صدور فیش حقوقی
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingPayrolls ? (
              <p>در حال بارگذاری...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام پرسنل</TableHead>
                    <TableHead>حقوق پایه</TableHead>
                    <TableHead>اضافه کاری</TableHead>
                    <TableHead>کسورات</TableHead>
                    <TableHead>حقوق خالص</TableHead>
                    <TableHead>تاریخ پرداخت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollsWithNames.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.personnelName}</TableCell>
                      <TableCell>{p.salary.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell>{p.overtimeHours.toLocaleString('fa-IR')} ساعت</TableCell>
                      <TableCell>{p.deductions.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell className="font-bold text-green-600">{p.netPay.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell>{p.payDate ? new Date(p.payDate.seconds * 1000).toLocaleDateString('fa-IR') : '...'}</TableCell>
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
            <DialogTitle>صدور فیش حقوقی جدید</DialogTitle>
            <DialogDescription>اطلاعات حقوقی را برای پرسنل مورد نظر وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="personnelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>انتخاب پرسنل</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="یکی از پرسنل را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {personnel?.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حقوق پایه (تومان)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 10000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="overtimeHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ساعات اضافه کاری</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کسورات (بیمه، مالیات و...)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 1500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">انصراف</Button>
                </DialogClose>
                <Button type="submit"><Save className="ml-2 h-4 w-4" /> ذخیره</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
