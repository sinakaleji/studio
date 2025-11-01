'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, Edit, Trash2 } from 'lucide-react';
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
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemoFirebase } from '@/firebase/provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const personnelSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  jobTitle: z.string().min(1, 'سمت شغلی الزامی است'),
  baseSalary: z.coerce.number().min(0, 'حقوق پایه الزامی است'),
  numberOfChildren: z.coerce.number().min(0, 'تعداد فرزندان نمی‌تواند منفی باشد').optional(),
  isMarried: z.boolean().optional(),
  contactNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

type PersonnelFormData = z.infer<typeof personnelSchema>;
type Personnel = PersonnelFormData & { id: string; };

export default function PersonnelPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const { firestore } = useFirebase();

  const form = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      baseSalary: 0,
      numberOfChildren: 0,
      isMarried: false,
      contactNumber: '',
      accountNumber: '',
      insuranceNumber: '',
    },
  });

  const personnelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'personnel');
  }, []);

  const { data: personnel, isLoading } = useCollection<Personnel>(personnelQuery);

  const handleAddNew = () => {
    setEditingPersonnel(null);
    form.reset({
      firstName: '',
      lastName: '',
      jobTitle: '',
      baseSalary: 0,
      numberOfChildren: 0,
      isMarried: false,
      contactNumber: '',
      accountNumber: '',
      insuranceNumber: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    form.reset(person);
    setIsDialogOpen(true);
  };

  const handleDelete = (personnelId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'personnel', personnelId));
  };


  const onSubmit = (data: PersonnelFormData) => {
    if (!firestore) return;
    if (editingPersonnel) {
        updateDocumentNonBlocking(doc(firestore, 'personnel', editingPersonnel.id), data);
    } else {
        addDocumentNonBlocking(collection(firestore, 'personnel'), data);
    }
    form.reset();
    setIsDialogOpen(false);
    setEditingPersonnel(null);
  };

  return (
    <AppLayout>
      <Header title="مدیریت پرسنل" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>لیست پرسنل</CardTitle>
              <CardDescription>مشاهده و مدیریت اطلاعات و حقوق پایه پرسنل</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن پرسنل
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>در حال بارگذاری...</p>
            ) : !personnel || personnel.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">هنوز هیچ پرسنلی ثبت نشده است.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام</TableHead>
                            <TableHead>سمت شغلی</TableHead>
                            <TableHead>حقوق پایه (تومان)</TableHead>
                            <TableHead>شماره تماس</TableHead>
                            <TableHead>عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personnel?.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{p.firstName?.charAt(0)}{p.lastName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {p.firstName} {p.lastName}
                                </TableCell>
                                <TableCell>{p.jobTitle}</TableCell>
                                <TableCell>{p.baseSalary?.toLocaleString('fa-IR') || '۰'}</TableCell>
                                <TableCell>{p.contactNumber || '-'}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(p)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="icon">
                                           <Trash2 className="h-4 w-4" />
                                         </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            این عمل غیرقابل بازگشت است. پرسنل "{p.firstName} {p.lastName}" برای همیشه حذف خواهد شد.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(p.id)}>حذف</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPersonnel ? 'ویرایش پرسنل' : 'افزودن پرسنل جدید'}</DialogTitle>
            <DialogDescription>اطلاعات کامل پرسنل را وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>نام</FormLabel><FormControl><Input placeholder="مثال: محمد" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>نام خانوادگی</FormLabel><FormControl><Input placeholder="مثال: کریمی" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="jobTitle" render={({ field }) => (
                    <FormItem><FormLabel>سمت شغلی</FormLabel><FormControl><Input placeholder="مثال: نگهبان" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="baseSalary" render={({ field }) => (
                    <FormItem><FormLabel>حقوق پایه ماهانه (تومان)</FormLabel><FormControl><Input type="number" placeholder="مثال: 10000000" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4 items-center">
                    <FormField control={form.control} name="numberOfChildren" render={({ field }) => (
                        <FormItem><FormLabel>تعداد فرزندان</FormLabel><FormControl><Input type="number" placeholder="مثال: 2" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField
                        control={form.control}
                        name="isMarried"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-start gap-2 pt-6">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className='mb-0'>متاهل</FormLabel>
                          </FormItem>
                        )}
                      />
                </div>
                 <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem><FormLabel>شماره تماس (اختیاری)</FormLabel><FormControl><Input placeholder="مثال: 09123456789" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                        <FormItem><FormLabel>شماره حساب (اختیاری)</FormLabel><FormControl><Input placeholder="شماره شبا یا شماره حساب" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="insuranceNumber" render={({ field }) => (
                        <FormItem><FormLabel>شماره بیمه (اختیاری)</FormLabel><FormControl><Input placeholder="کد کارگاه و شماره بیمه" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">انصراف</Button>
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
