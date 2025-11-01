'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
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
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


const allPermissions = [
    { id: 'view_dashboard', label: 'مشاهده داشبورد' },
    { id: 'manage_villas', label: 'مدیریت ویلاها' },
    { id: 'manage_stakeholders', label: 'مدیریت ذی‌نفعان' },
    { id: 'manage_personnel', label: 'مدیریت پرسنل' },
    { id: 'manage_attendance', label: 'مدیریت حضور و غیاب' },
    { id: 'view_finance', label: 'مشاهده امور مالی' },
    { id: 'manage_finance', label: 'مدیریت امور مالی' },
    { id: 'view_payroll', label: 'مشاهده حقوق و دستمزد' },
    { id: 'manage_payroll', label: 'مدیریت حقوق و دستمزد' },
    { id: 'manage_documents', label: 'مدیریت مدارک' },
    { id: 'manage_users', label: 'مدیریت کاربران' },
    { id: 'manage_settings', label: 'مدیریت تنظیمات' },
];

const userFormSchema = z.object({
    displayName: z.string().min(1, 'نام نمایشی الزامی است'),
    email: z.string().email('ایمیل نامعتبر است'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    roleId: z.string().min(1, 'انتخاب نقش الزامی است'),
});

const editFormSchema = z.object({
    roleId: z.string().min(1, 'انتخاب نقش الزامی است'),
    permissions: z.array(z.string()).optional(),
});


type UserFormData = z.infer<typeof userFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

type User = {
  uid: string;
  email: string;
  displayName: string | null;
  roleId: string | null;
};
type Role = {
    id: string;
    name: string;
    permissions: string[];
}

export default function UsersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const { firestore, auth: mainAuth } = useFirebase();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, []);
  const rolesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'roles') : null, []);

  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);
  const { data: roles, isLoading: isLoadingRoles } = useCollection<Role>(rolesQuery);
  
  const rolesMap = useMemo(() => new Map(roles?.map(r => [r.id, r])), [roles]);

  const addUserForm = useForm<UserFormData>({
      resolver: zodResolver(userFormSchema),
      defaultValues: { displayName: '', email: '', password: '', roleId: '' }
  });
  const editUserForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { roleId: '', permissions: [] }
  });

  const selectedRoleId = editUserForm.watch('roleId');

  useEffect(() => {
    if (selectedRoleId && rolesMap.has(selectedRoleId)) {
        editUserForm.setValue('permissions', rolesMap.get(selectedRoleId)!.permissions);
    }
  }, [selectedRoleId, rolesMap, editUserForm]);


  const handleOpenAddDialog = () => {
      addUserForm.reset();
      setIsAddDialogOpen(true);
  }

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const roleId = user.roleId || '';
    const permissions = rolesMap.get(roleId)?.permissions || [];
    editUserForm.reset({ roleId, permissions });
    setIsEditDialogOpen(true);
  };

  const onAddSubmit = async (data: UserFormData) => {
      if (!mainAuth || !firestore) {
          toast({ variant: 'destructive', title: 'خطا', description: 'سرویس Firebase در دسترس نیست.' });
          return;
      };
      setIsSubmitting(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(mainAuth, data.email, data.password);
        const user = userCredential.user;

        await setDoc(doc(firestore, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: data.displayName,
            roleId: data.roleId,
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

  const onEditSubmit = (data: EditFormData) => {
    if (!firestore || !editingUser) return;
    
    // Update user's roleId
    updateDocumentNonBlocking(doc(firestore, 'users', editingUser.uid), { roleId: data.roleId });
    
    // Update permissions for the selected role
    if(data.permissions) {
        const roleRef = doc(firestore, 'roles', data.roleId);
        updateDocumentNonBlocking(roleRef, { permissions: data.permissions });
    }
    
    toast({ title: 'موفقیت‌آمیز', description: `اطلاعات کاربر و نقش به‌روزرسانی شد.`});
    editUserForm.reset();
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };
  
  const getRoleVariant = (roleId: string | null): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (roleId) {
        case 'super_admin': return 'destructive';
        case 'admin': return 'default';
        case 'financial_expert': return 'secondary';
        default: return 'outline';
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
            {isLoadingUsers ? (
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
                         <Badge variant={getRoleVariant(user.roleId)}>{rolesMap.get(user.roleId || '')?.name || 'بدون نقش'}</Badge>
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>افزودن کاربر جدید</DialogTitle>
            <DialogDescription>
              اطلاعات کاربر جدید را برای ایجاد حساب کاربری وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(onAddSubmit)} className="space-y-4 pt-4">
                <FormField control={addUserForm.control} name="displayName" render={({ field }) => (
                    <FormItem><FormLabel>نام نمایشی</FormLabel><FormControl><Input placeholder="مثال: علی رضایی" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={addUserForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>ایمیل</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={addUserForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>رمز عبور</FormLabel><FormControl><Input type="password" placeholder="حداقل ۶ کاراکتر" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField
                    control={addUserForm.control}
                    name="roleId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>نقش</FormLabel>
                        <FormControl>
                             <select {...field} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="" disabled>یک نقش را انتخاب کنید</option>
                                {roles?.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
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
      
      {/* Edit User/Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر و دسترسی‌ها</DialogTitle>
            <DialogDescription>
              نقش کاربر «{editingUser?.email}» و دسترسی‌های آن نقش را مدیریت کنید.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={editUserForm.control}
                    name="roleId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>نقش کاربر</FormLabel>
                        <FormControl>
                             <select {...field} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="" disabled>یک نقش را انتخاب کنید</option>
                                {roles?.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
              
              <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                        <span>{`ویرایش دسترسی‌های نقش «${rolesMap.get(selectedRoleId)?.name || ''}»`}</span>
                        <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Controller
                        control={editUserForm.control}
                        name="permissions"
                        render={({ field }) => (
                             <div className="p-4 border rounded-md mt-2 space-y-3 max-h-60 overflow-y-auto">
                                <p className="text-sm font-medium text-muted-foreground">این تغییرات برای تمام کاربران با این نقش اعمال خواهد شد.</p>
                                {allPermissions.map((permission) => (
                                <FormItem key={permission.id} className="flex flex-row items-center space-x-3 space-y-0 rtl:space-x-reverse">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                                const newValue = checked
                                                ? [...(field.value || []), permission.id]
                                                : (field.value || []).filter((value) => value !== permission.id);
                                                field.onChange(newValue);
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">{permission.label}</FormLabel>
                                </FormItem>
                                ))}
                            </div>
                        )}
                    />
                </CollapsibleContent>
              </Collapsible>

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
    </AppLayout>
  );
}

    