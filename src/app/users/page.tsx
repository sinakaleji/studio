'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Loader2 } from 'lucide-react';
import { useCollection, useFirebase, createUserWithEmailAndPassword } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';


const userRoleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'financial_expert'], {
    required_error: 'انتخاب نقش الزامی است',
  }),
});

const newUserSchema = z.object({
    displayName: z.string().min(1, 'نام نمایشی الزامی است'),
    email: z.string().email('ایمیل نامعتبر است'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    role: z.enum(['super_admin', 'admin', 'financial_expert'], { required_error: 'انتخاب نقش الزامی است'}),
});

type UserRoleFormData = z.infer<typeof userRoleSchema>;
type NewUserFormData = z.infer<typeof newUserSchema>;

type User = {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'super_admin' | 'admin' | 'financial_expert' | null;
};

export default function UsersPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { firestore, auth: mainAuth } = useFirebase();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const roleForm = useForm<UserRoleFormData>({
    resolver: zodResolver(userRoleSchema),
  });
  
  const newUserForm = useForm<NewUserFormData>({
      resolver: zodResolver(newUserSchema),
      defaultValues: {
          displayName: '',
          email: '',
          password: '',
          role: 'admin',
      }
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    roleForm.reset({ role: user.role ?? undefined });
    setIsEditDialogOpen(true);
  };
  
  const handleOpenAddDialog = () => {
      newUserForm.reset();
      setIsAddDialogOpen(true);
  }

  const onEditSubmit = (data: UserRoleFormData) => {
    if (!firestore || !editingUser) return;
    updateDocumentNonBlocking(doc(firestore, 'users', editingUser.uid), data);
    roleForm.reset();
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };
  
  const onAddSubmit = async (data: NewUserFormData) => {
      if (!mainAuth || !firestore) {
          toast({ variant: 'destructive', title: 'خطا', description: 'سرویس Firebase در دسترس نیست.' });
          return;
      };
      setIsSubmitting(true);
      try {
        // Note: This creates a new user in the primary Firebase Auth instance.
        const userCredential = await createUserWithEmailAndPassword(mainAuth, data.email, data.password);
        const user = userCredential.user;

        await setDoc(doc(firestore, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: data.displayName,
            role: data.role,
        });

        toast({ title: 'موفقیت‌آمیز', description: `کاربر ${data.displayName} با موفقیت ایجاد شد.`});
        setIsAddDialogOpen(false);
      } catch (error) {
        let description = 'مشکلی در هنگام ایجاد کاربر به وجود آمد.';
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
            description = 'این ایمیل قبلاً ثبت‌نام شده است.';
            }
        }
        toast({ variant: 'destructive', title: 'خطا در ایجاد کاربر', description });
      } finally {
        setIsSubmitting(false);
      }
  }
  
  const getRoleVariant = (role: User['role']): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (role) {
        case 'super_admin': return 'destructive';
        case 'admin': return 'default';
        case 'financial_expert': return 'secondary';
        default: return 'outline';
    }
  }
  
  const getRoleDisplayName = (role: User['role']) => {
      switch (role) {
          case 'super_admin': return 'سوپر ادمین';
          case 'admin': return 'ادمین';
          case 'financial_expert': return 'کارشناس مالی';
          default: return 'بدون نقش';
      }
  }

  return (
    <AppLayout>
      <Header title="مدیریت کاربران" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>لیست کاربران سیستم</CardTitle>
                <CardDescription>مدیریت نقش‌ها و سطح دسترسی کاربران</CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog}>
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن کاربر جدید
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>در حال بارگذاری کاربران...</p>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">هیچ کاربری در سیستم وجود ندارد.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کاربر</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>نقش</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{(user.displayName || user.email)?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {user.displayName || user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleVariant(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
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

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ویرایش نقش کاربر</DialogTitle>
            <DialogDescription>
              نقش کاربر «{editingUser?.email}» را تغییر دهید.
            </DialogDescription>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نقش</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="یک نقش انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super_admin">سوپر ادمین</SelectItem>
                        <SelectItem value="admin">ادمین</SelectItem>
                        <SelectItem value="financial_expert">کارشناس مالی</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">انصراف</Button>
                </DialogClose>
                <Button type="submit">ذخیره تغییرات</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>افزودن کاربر جدید</DialogTitle>
            <DialogDescription>
              اطلاعات کاربر جدید را برای ایجاد حساب کاربری وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <Form {...newUserForm}>
            <form onSubmit={newUserForm.handleSubmit(onAddSubmit)} className="space-y-4 pt-4">
                <FormField control={newUserForm.control} name="displayName" render={({ field }) => (
                    <FormItem><FormLabel>نام نمایشی</FormLabel><FormControl><Input placeholder="مثال: علی رضایی" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={newUserForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>ایمیل</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={newUserForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>رمز عبور</FormLabel><FormControl><Input type="password" placeholder="حداقل ۶ کاراکتر" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={newUserForm.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>نقش</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="یک نقش انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super_admin">سوپر ادمین</SelectItem>
                        <SelectItem value="admin">ادمین</SelectItem>
                        <SelectItem value="financial_expert">کارشناس مالی</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>انصراف</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    ایجاد کاربر
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
