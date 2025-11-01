'use client';
import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, Eye, Loader2 } from 'lucide-react';
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
import { useCollection, useDoc, useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp, doc, where, query, getDocs, Timestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';
import { lastDayOfMonth, format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import PayslipDialog from './_components/payslip-dialog';

const payrollSchema = z.object({
  personnelId: z.string().min(1, 'انتخاب پرسنل الزامی است'),
  month: z.string().min(1, 'انتخاب ماه الزامی است'),
});

type PayrollFormData = z.infer<typeof payrollSchema>;
type Personnel = { id: string; firstName: string; lastName: string; jobTitle: string; baseSalary: number; numberOfChildren?: number; isMarried?: boolean; };
type Attendance = { id: string; status: 'present' | 'absent'; entryTime?: string; exitTime?: string; };
type PayrollSettings = { 
    insuranceRate: number; 
    taxBrackets: { from: number; to: number; rate: number }[];
    monthlyHousingAllowance: number;
    monthlyFoodAllowance: number;
    perChildAllowance: number;
    marriageAllowance: number;
    monthlySeniorityBase: number;
};
type Payroll = {
    id: string;
    personnelId: string;
    personnelName?: string;
    payDate: Timestamp;
    month: string;
    baseSalary: number;
    housingAllowance: number;
    foodAllowance: number;
    childAllowance: number;
    marriageAllowance: number;
    seniorityPay: number;
    overtimeHours: number;
    overtimePay: number;
    totalEarnings: number;
    insuranceDeduction: number;
    taxDeduction: number;
    totalDeductions: number;
    netPay: number;
};


const OVERTIME_RATE = 1.4; 
const WORK_HOURS_PER_MONTH = 192; 

export default function PayrollPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payroll | null>(null);

  const { firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: { personnelId: '', month: '' },
  });
  
  const { setValue, getValues } = form;

  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, [firestore]);
  const { data: personnel, isLoading: isLoadingPersonnel } = useCollection<Personnel>(personnelQuery);

  const selectedMonth = form.watch('month');
  const payrollsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedMonth) return null;
    return query(collection(firestore, 'payrolls'), where('month', '==', selectedMonth));
  }, [firestore, selectedMonth]);
  const { data: payrolls, isLoading: isLoadingPayrolls } = useCollection<Payroll>(payrollsQuery);

  const payrollSettingsDoc = useMemoFirebase(() => firestore ? doc(firestore, 'payroll_settings', 'default') : null, [firestore]);
  const { data: payrollSettings } = useDoc<PayrollSettings>(payrollSettingsDoc);

  const personnelMap = useMemo(() => {
    if (!personnel) return new Map();
    return new Map(personnel.map(p => [p.id, { name: `${p.firstName} ${p.lastName}`, details: p }]));
  }, [personnel]);
  
  const payrollsWithNames = useMemo(() => {
      return payrolls?.map(p => ({
          ...p,
          personnelName: personnelMap.get(p.personnelId)?.name || 'نامشخص'
      })) ?? [];
  }, [payrolls, personnelMap]);

  const months = useMemo(() => {
    const monthOptions: { label: string; value: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthOptions.push({
            label: format(date, 'MMMM yyyy', { locale: faIR }),
            value: format(date, 'yyyy-MM'),
        });
    }
    return monthOptions;
  }, []);

  useEffect(() => {
    if (months.length > 0 && !getValues('month')) {
      setValue('month', months[0].value);
    }
  }, [months, setValue, getValues]);


  const calculatePayroll = async (data: PayrollFormData) => {
    const selectedPersonnel = personnelMap.get(data.personnelId)?.details;
    if (!firestore || !payrollSettings || !selectedPersonnel) {
        toast({ variant: 'destructive', title: 'خطا', description: 'اطلاعات پرسنل یا تنظیمات حقوق و دستمزد بارگذاری نشده است.' });
        return;
    }

    setIsCalculating(true);
    
    // 1. Fetch Attendance Data
    const [year, month] = data.month.split('-').map(Number);
    const startDate = `${data.month}-01`;
    const endDate = format(lastDayOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

    const attendanceQuery = query(
        collection(firestore, 'attendances'),
        where('personnelId', '==', data.personnelId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendances = attendanceSnapshot.docs.map(doc => doc.data() as Attendance);

    // 2. Calculate Hours
    let totalWorkHours = 0;
    attendances.forEach(att => {
        if (att.status === 'present' && att.entryTime && att.exitTime) {
            const entry = new Date(`1970-01-01T${att.entryTime}`);
            const exit = new Date(`1970-01-01T${att.exitTime}`);
            const diff = (exit.getTime() - entry.getTime()) / (1000 * 60 * 60); // difference in hours
            totalWorkHours += diff > 0 ? diff : 0;
        }
    });
    
    const baseSalary = selectedPersonnel.baseSalary || 0;
    const overtimeHours = Math.max(0, totalWorkHours - WORK_HOURS_PER_MONTH);
    const hourlyRate = baseSalary / WORK_HOURS_PER_MONTH;
    const overtimePay = overtimeHours * hourlyRate * OVERTIME_RATE;

    // 3. Calculate Benefits
    const housingAllowance = payrollSettings.monthlyHousingAllowance || 0;
    const foodAllowance = payrollSettings.monthlyFoodAllowance || 0;
    const childAllowance = (selectedPersonnel.numberOfChildren || 0) * (payrollSettings.perChildAllowance || 0);
    const marriageAllowance = (selectedPersonnel.isMarried ? payrollSettings.marriageAllowance : 0) || 0;
    const seniorityPay = payrollSettings.monthlySeniorityBase || 0; // Assuming everyone gets it for simplicity

    const totalEarnings = baseSalary + housingAllowance + foodAllowance + childAllowance + marriageAllowance + seniorityPay + overtimePay;

    // 4. Calculate Deductions
    const insuranceDeduction = totalEarnings * (payrollSettings.insuranceRate / 100);
    
    let taxDeduction = 0;
    const annualTaxableIncome = totalEarnings * 12;
    let annualTax = 0;

    payrollSettings.taxBrackets.forEach(bracket => {
        if (annualTaxableIncome > bracket.from) {
            const incomeInBracket = Math.min(annualTaxableIncome, bracket.to === Infinity ? annualTaxableIncome : bracket.to) - bracket.from;
            if (incomeInBracket > 0) {
                annualTax += incomeInBracket * (bracket.rate / 100);
            }
        }
    });

    taxDeduction = annualTax > 0 ? annualTax / 12 : 0;
    
    const totalDeductions = insuranceDeduction + taxDeduction;
    const netPay = totalEarnings - totalDeductions;

    // 5. Create Payroll Document
    const payrollData: Omit<Payroll, 'id' | 'payDate' | 'personnelName'> = {
      personnelId: data.personnelId,
      month: data.month,
      baseSalary: parseFloat(baseSalary.toFixed(0)),
      housingAllowance: parseFloat(housingAllowance.toFixed(0)),
      foodAllowance: parseFloat(foodAllowance.toFixed(0)),
      childAllowance: parseFloat(childAllowance.toFixed(0)),
      marriageAllowance: parseFloat(marriageAllowance.toFixed(0)),
      seniorityPay: parseFloat(seniorityPay.toFixed(0)),
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
      overtimePay: parseFloat(overtimePay.toFixed(0)),
      totalEarnings: parseFloat(totalEarnings.toFixed(0)),
      insuranceDeduction: parseFloat(insuranceDeduction.toFixed(0)),
      taxDeduction: parseFloat(taxDeduction.toFixed(0)),
      totalDeductions: parseFloat(totalDeductions.toFixed(0)),
      netPay: parseFloat(netPay.toFixed(0)),
    };
    
    const finalDoc = { ...payrollData, payDate: serverTimestamp() };
    await addDocumentNonBlocking(collection(firestore, 'payrolls'), finalDoc);

    setIsCalculating(false);
    setIsFormOpen(false);
    form.reset({ personnelId: '', month: data.month });
    toast({ title: 'موفقیت‌آمیز', description: 'فیش حقوقی جدید با موفقیت محاسبه و ثبت شد.' });
  };


  return (
    <AppLayout>
      <Header title="حقوق و دستمزد" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>لیست حقوق و دستمزد</CardTitle>
              <CardDescription>صدور و مشاهده فیش‌های حقوقی پرسنل</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
                 <Select value={selectedMonth} onValueChange={(value) => form.setValue('month', value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="ماه را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                 </Select>
                 <Button onClick={() => setIsFormOpen(true)} disabled={isLoadingPersonnel}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    صدور فیش حقوقی
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPayrolls ? (
              <p>در حال بارگذاری...</p>
            ) : !payrollsWithNames || payrollsWithNames.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">هیچ فیش حقوقی برای ماه انتخاب شده ثبت نشده است.</p>
                </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام پرسنل</TableHead>
                    <TableHead>حقوق پایه</TableHead>
                    <TableHead>جمع درآمد</TableHead>
                    <TableHead>جمع کسورات</TableHead>
                    <TableHead>خالص پرداختی</TableHead>
                    <TableHead>تاریخ پرداخت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollsWithNames.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.personnelName}</TableCell>
                      <TableCell>{p.baseSalary.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell>{p.totalEarnings.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell className='text-destructive'>{p.totalDeductions.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell className="font-bold text-green-600">{p.netPay.toLocaleString('fa-IR')} تومان</TableCell>
                      <TableCell>{p.payDate ? new Date(p.payDate.seconds * 1000).toLocaleDateString('fa-IR') : '...'}</TableCell>
                      <TableCell>
                          <Button variant="outline" size="icon" onClick={() => setSelectedPayslip(p)}>
                              <Eye className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>صدور فیش حقوقی جدید</DialogTitle>
            <DialogDescription>پرسنل و ماه مورد نظر را برای محاسبه خودکار حقوق انتخاب کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculatePayroll)} className="space-y-4">
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
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>انتخاب ماه</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="ماه را انتخاب کنید" />
                        </Trigger>
                        </FormControl>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isCalculating}>انصراف</Button>
                </DialogClose>
                <Button type="submit" disabled={isCalculating || !payrollSettings}>
                    {isCalculating ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            در حال محاسبه...
                        </>
                    ) : (
                        <><Save className="ml-2 h-4 w-4" /> محاسبه و ذخیره</>
                    )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <PayslipDialog
        payslip={selectedPayslip}
        open={!!selectedPayslip}
        onOpenChange={(open) => !open && setSelectedPayslip(null)}
      />

    </AppLayout>
  );
}
