'use client';
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemoFirebase } from '@/firebase/provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const villaSchema = z.object({
  villaNumber: z.string().min(1, 'شماره ویلا الزامی است'),
  location: z.string().min(1, 'موقعیت الزامی است'),
  size: z.coerce.number().min(1, 'متراژ الزامی است'),
  ownerId: z.string().min(1, 'انتخاب مالک الزامی است'),
});

type VillaFormData = z.infer<typeof villaSchema>;
type Villa = VillaFormData & { 
  id: string; 
  ownerName?: string;
};
type Stakeholder = { 
  id: string; 
  name: string; 
};

export default function VillasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const { firestore } = useFirebase();

  const form = useForm<VillaFormData>({
    resolver: zodResolver(villaSchema),
    defaultValues: {
      villaNumber: '',
      location: '',
      size: 0,
      ownerId: '',
    },
  });

  const villasQuery = useMemoFirebase(() => firestore ? collection(firestore, 'villas') : null, [firestore]);
  const stakeholdersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stakeholders') : null, [firestore]);

  const { data: villas, isLoading: isLoadingVillas } = useCollection<Villa>(villasQuery);
  const { data: stakeholders, isLoading: isLoadingStakeholders } = useCollection<Stakeholder>(stakeholdersQuery);

  const stakeholderMap = useMemo(() => {
    if (!stakeholders) return new Map();
    return new Map(stakeholders.map(s => [s.id, s.name]));
  }, [stakeholders]);

  const villasWithOwners = useMemo(() => {
    return villas?.map(v => ({
      ...v,
      ownerName: stakeholderMap.get(v.ownerId) || 'نامشخص'
    })) ?? [];
  }, [villas, stakeholderMap]);

  const handleAddNew = () => {
    setEditingVilla(null);
    form.reset({ villaNumber: '', location: '', size: 0, ownerId: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (villa: Villa) => {
    setEditingVilla(villa);
    form.reset(villa);
    setIsDialogOpen(true);
  };

  const handleDelete = (villaId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'villas', villaId));
  };

  const onSubmit = (data: VillaFormData) => {
    if (!firestore) return;

    const selectedStakeholder = stakeholders?.find(s => s.id === data.ownerId);
    const villaData = {
        ...data,
        ownerName: selectedStakeholder?.name || 'نامشخص',
    };

    if (editingVilla) {
      updateDocumentNonBlocking(doc(firestore, 'villas', editingVilla.id), villaData);
    } else {
      addDocumentNonBlocking(collection(firestore, 'villas'), villaData);
    }
    form.reset();
    setIsDialogOpen(false);
    setEditingVilla(null);
  };

  return (
    <AppLayout>
      <Header title="مدیریت ویلاها" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>لیست ویلاها</CardTitle>
              <CardDescription>مشاهده و مدیریت ویلاهای ثبت شده در شهرک</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن ویلا
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingVillas ? (
              <p>در حال بارگذاری...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره ویلا</TableHead>
                    <TableHead>موقعیت</TableHead>
                    <TableHead>متراژ (متر مربع)</TableHead>
                    <TableHead>مالک</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {villasWithOwners.map((villa) => (
                    <TableRow key={villa.id}>
                      <TableCell>
                        <Badge>{villa.villaNumber}</Badge>
                      </TableCell>
                      <TableCell>{villa.location}</TableCell>
                      <TableCell>{villa.size}</TableCell>
                      <TableCell>{villa.ownerName}</TableCell>
                       <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(villa)}>
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
                                این عمل غیرقابل بازگشت است. ویلای {villa.villaNumber} برای همیشه حذف خواهد شد.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(villa.id)}>حذف</AlertDialogAction>
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
            <DialogTitle>{editingVilla ? 'ویرایش ویلا' : 'افزودن ویلای جدید'}</DialogTitle>
            <DialogDescription>
              {editingVilla ? 'اطلاعات ویلا را ویرایش کنید.' : 'اطلاعات ویلای جدید را وارد کنید.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="villaNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره ویلا</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: A101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>موقعیت</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: فاز ۱، خیابان یاس" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>متراژ (متر مربع)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 300" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مالک</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="مالک ویلا را انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingStakeholders ? (
                            <SelectItem value="loading" disabled>در حال بارگذاری...</SelectItem>
                          ) : (
                            stakeholders?.map(s => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
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
