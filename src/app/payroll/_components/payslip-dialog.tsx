'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';

type Payroll = {
    id: string;
    personnelId: string;
    personnelName: string;
    payDate: any;
    month: string;
    baseSalary: number;
    overtimeHours: number;
    overtimePay: number;
    totalEarnings: number;
    insuranceDeduction: number;
    taxDeduction: number;
    totalDeductions: number;
    netPay: number;
};

type PayslipDialogProps = {
  payslip: Payroll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PayslipRow = ({ label, value, isBold = false, isTotal=false }: { label: string; value: string | number; isBold?: boolean, isTotal?: boolean }) => (
    <>
        <p className={`text-sm ${isBold ? 'font-semibold' : ''}`}>{label}</p>
        <p className={`text-sm text-left ${isBold ? 'font-semibold' : ''}`}>{typeof value === 'number' ? value.toLocaleString('fa-IR') : value} تومان</p>
        {isTotal && <Separator className="col-span-2 my-1" />}
    </>
);


export default function PayslipDialog({ payslip, open, onOpenChange }: PayslipDialogProps) {
  if (!payslip) return null;

  const monthLabel = format(new Date(`${payslip.month}-01`), 'MMMM yyyy', { locale: faIR });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>فیش حقوقی - {monthLabel}</DialogTitle>
          <DialogDescription>
            جزئیات محاسبه حقوق برای {payslip.personnelName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-4">
                <h4 className="col-span-2 text-base font-semibold text-green-600 mb-2">درآمدها</h4>
                <PayslipRow label="حقوق پایه" value={payslip.baseSalary} />
                <PayslipRow label={`اضافه کاری (${payslip.overtimeHours.toLocaleString('fa-IR')} ساعت)`} value={payslip.overtimePay} />
                <Separator className="col-span-2 my-2" />
                <PayslipRow label="جمع درآمد" value={payslip.totalEarnings} isBold />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-4">
                <h4 className="col-span-2 text-base font-semibold text-red-600 mb-2">کسورات</h4>
                <PayslipRow label="بیمه" value={payslip.insuranceDeduction} />
                <PayslipRow label="مالیات" value={payslip.taxDeduction} />
                <Separator className="col-span-2 my-2" />
                <PayslipRow label="جمع کسورات" value={payslip.totalDeductions} isBold />
            </div>

             <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border-2 border-primary p-4">
                 <PayslipRow label="حقوق خالص پرداختی" value={payslip.netPay} isBold />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              بستن
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
