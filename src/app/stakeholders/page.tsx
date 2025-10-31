'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const stakeholderSchema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  contactNumber: z.string().optional(),
});

type StakeholderFormData = z.infer<typeof stakeholderSchema>;
type Stakeholder = StakeholderFormData & { id: string };

export default function StakeholdersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const { firestore } = useFirebase();

  const stakeholdersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'stakeholders');
  }, [firestore]);

  const { data: stakeholders, isLoading } = useCollection<Stakeholder>(stakeholdersQuery);

  const form = useForm<StakeholderFormData>({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: { name: '', email: '', contactNumber: '' },
  });

  const handleAddNew = () => {
    setEditingStakeholder(null);
    form.reset({ name: '', email: '', contactNumber: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    form.reset(stakeholder);
    setIsDialogOpen(true);
  };

  const handleDelete = (stakeholderId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'stakeholders', stakeholderId));
  };

  const onSubmit = (data: StakeholderFormData) => {
    if (!firestore) return;
    if (editingStakeholder) {
      updateDocumentNonBlocking(doc(firestore, 'stakeholders', editingStakeholder.id), data);
    } else {
      addDocumentNonBlocking(collection(firestore, 'stakeholders'), data);
    }
    form.reset();
    setIsDialogOpen(false);
    setEditingStakeholder(null);
  };

  return (
    <AppLayout>
      <Header title="مدیریت ذی‌نفعان" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>لیست ذی‌نفعان</CardTitle>
              <CardDescription>مشاهده و مدیریت مالکین و سایر افراد مرتبط</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن ذی‌نفع
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>در حال بارگذاری...</p>
            ) : !stakeholders || stakeholders.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">هنوز هیچ ذی‌نفعی ثبت نشده است.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام</TableHead>
                            <TableHead>ایمیل</TableHead>
                            <TableHead>شماره تماس</TableHead>
                            <TableHead>عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stakeholders?.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{s.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {s.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{s.email || '-'}</TableCell>
                                <TableCell className="text-muted-foreground">{s.contactNumber || '-'}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(s)}>
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
                                            این عمل غیرقابل بازگشت است. ذی‌نفع "{s.name}" برای همیشه حذف خواهد شد.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(s.id)}>حذف</AlertDialogAction>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStakeholder ? 'ویرایش ذی‌نفع' : 'افزودن ذی‌نفع جدید'}</DialogTitle>
            <DialogDescription>اطلاعات فرد مورد نظر را وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: خانواده رضایی" {...field} />
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
                    <FormLabel>ایمیل (اختیاری)</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" {...field} />
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
                      <Input placeholder="09123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
