'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const userRoleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'financial_expert'], {
    required_error: 'انتخاب نقش الزامی است',
  }),
});

type UserRoleFormData = z.infer<typeof userRoleSchema>;
type User = {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'super_admin' | 'admin' | 'financial_expert' | null;
};

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { firestore } = useFirebase();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const form = useForm<UserRoleFormData>({
    resolver: zodResolver(userRoleSchema),
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({ role: user.role ?? undefined });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: UserRoleFormData) => {
    if (!firestore || !editingUser) return;
    updateDocumentNonBlocking(doc(firestore, 'users', editingUser.uid), data);
    form.reset();
    setIsDialogOpen(false);
    setEditingUser(null);
  };
  
  const getRoleVariant = (role: User['role']) => {
    switch (role) {
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
          <CardHeader>
            <CardTitle>لیست کاربران سیستم</CardTitle>
            <CardDescription>مدیریت نقش‌ها و سطح دسترسی کاربران</CardDescription>
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
                          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {user.displayName || 'بدون نام'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleVariant(user.role)}>{user.role || 'بدون نقش'}</Badge>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ویرایش نقش کاربر</DialogTitle>
            <DialogDescription>
              نقش کاربر «{editingUser?.email}» را تغییر دهید.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
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
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="financial_expert">Financial Expert</SelectItem>
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
    </AppLayout>
  );
}
