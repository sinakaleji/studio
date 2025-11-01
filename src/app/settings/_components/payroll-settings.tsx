'use client';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDoc, useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { InputGroup, InputGroupText } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';

const taxBracketSchema = z.object({
    from: z.coerce.number().min(0),
    to: z.coerce.number().min(0),
    rate: z.coerce.number().min(0).max(100),
});

const payrollSettingsSchema = z.object({
  insuranceRate: z.coerce.number().min(0, 'نرخ بیمه نمی‌تواند منفی باشد').max(100, 'نرخ بیمه نمی‌تواند بیشتر از ۱۰۰ باشد'),
  monthlyHousingAllowance: z.coerce.number().min(0, 'حق مسکن نمی‌تواند منفی باشد'),
  monthlyFoodAllowance: z.coerce.number().min(0, 'بن خواروبار نمی‌تواند منفی باشد'),
  perChildAllowance: z.coerce.number().min(0, 'حق اولاد نمی‌تواند منفی باشد'),
  marriageAllowance: z.coerce.number().min(0, 'حق تاهل نمی‌تواند منفی باشد'),
  monthlySeniorityBase: z.coerce.number().min(0, 'پایه سنوات نمی‌تواند منفی باشد'),
  taxBrackets: z.array(taxBracketSchema),
});

type PayrollSettingsFormData = z.infer<typeof payrollSettingsSchema>;
type PayrollSettingsData = PayrollSettingsFormData & { id: string };

const PAYROLL_SETTINGS_DOC_ID = "default";

export default function PayrollSettings() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const settingsDocRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'payroll_settings', PAYROLL_SETTINGS_DOC_ID);
  }, [firestore]);

  const { data: settingsData, isLoading } = useDoc<PayrollSettingsData>(settingsDocRef);

  const form = useForm<PayrollSettingsFormData>({
    resolver: zodResolver(payrollSettingsSchema),
    defaultValues: {
      insuranceRate: 7,
      monthlyHousingAllowance: 9000000,
      monthlyFoodAllowance: 22000000,
      perChildAllowance: 10390968,
      marriageAllowance: 5000000,
      monthlySeniorityBase: 2820000,
      taxBrackets: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "taxBrackets"
  });

  useEffect(() => {
    if (settingsData) {
      form.reset({
          ...settingsData,
          taxBrackets: settingsData.taxBrackets.map(b => ({...b, to: b.to === Infinity ? 0 : b.to}))
      });
    }
  }, [settingsData, form]);

  const onSubmit = (data: PayrollSettingsFormData) => {
    if (!firestore) return;
    const dataToSave = {
        ...data,
        taxBrackets: data.taxBrackets.map(b => ({...b, to: b.to === 0 || b.to === null ? Infinity : b.to }))
    }
    setDocumentNonBlocking(doc(firestore, 'payroll_settings', PAYROLL_SETTINGS_DOC_ID), dataToSave, { merge: true });
    toast({
      title: 'موفقیت‌آمیز',
      description: 'تنظیمات حقوق و دستمزد با موفقیت ذخیره شد.',
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className='space-y-4'>
            <h4 className='font-medium'>مزایای ماهانه (تومان)</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg'>
                <FormField control={form.control} name="monthlyHousingAllowance" render={({ field }) => (
                    <FormItem><FormLabel>حق مسکن</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="monthlyFoodAllowance" render={({ field }) => (
                    <FormItem><FormLabel>بن خواروبار</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="perChildAllowance" render={({ field }) => (
                    <FormItem><FormLabel>حق اولاد (به ازای هر فرزند)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="marriageAllowance" render={({ field }) => (
                    <FormItem><FormLabel>حق تاهل</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="monthlySeniorityBase" render={({ field }) => (
                    <FormItem><FormLabel>پایه سنوات ماهانه</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>

        <Separator />

        <div className="space-y-4">
            <h4 className='font-medium'>کسورات</h4>
            <div className='p-4 border rounded-lg space-y-6'>
                <FormField
                control={form.control}
                name="insuranceRate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>نرخ بیمه (سهم کارمند)</FormLabel>
                    <InputGroup className='max-w-xs'>
                        <Input type="number" placeholder="مثال: 7" {...field} />
                        <InputGroupText>%</InputGroupText>
                    </InputGroup>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <div className="space-y-4">
                    <FormLabel>پلکان‌های مالیاتی سالانه (تومان)</FormLabel>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center p-2 border rounded-md">
                            <FormField
                                control={form.control}
                                name={`taxBrackets.${index}.from`}
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs">از</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`taxBrackets.${index}.to`}
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs">تا</FormLabel>
                                        <FormControl><Input type="number" placeholder="برای بی‌نهایت 0 بگذارید" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`taxBrackets.${index}.rate`}
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs">نرخ</FormLabel>
                                        <FormControl>
                                            <InputGroup>
                                                <Input type="number" {...field} />
                                                <InputGroupText>%</InputGroupText>
                                            </InputGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="col-span-1 flex items-end justify-end h-full">
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ from: fields.length > 0 ? (fields[fields.length-1].to > 0 ? fields[fields.length-1].to + 1 : 0) : 0, to: 0, rate: 0 })}
                    >
                        <PlusCircle className="ml-2 h-4 w-4" />
                        افزودن پلکان مالیاتی
                    </Button>
                </div>
            </div>
        </div>


        <Button type="submit">ذخیره تغییرات</Button>
      </form>
    </Form>
  );
}
