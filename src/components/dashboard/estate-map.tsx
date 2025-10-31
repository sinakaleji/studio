'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusCircle, Home, Edit, Trash2 } from 'lucide-react';
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
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const villaSchema = z.object({
  villaNumber: z.string().min(1, 'شماره ویلا الزامی است'),
  location: z.string().min(1, 'موقعیت الزامی است'),
  size: z.coerce.number().min(1, 'متراژ الزامی است'),
  ownerId: z.string().min(1, 'انتخاب مالک الزامی است'),
});

type VillaFormData = z.infer<typeof villaSchema>;
type Villa = VillaFormData & { id: string; ownerName?: string };
type Stakeholder = { id: string; name: string; };

export default function EstateMap() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
    const { firestore } = useFirebase();

    const villasQuery = useMemoFirebase(() => firestore ? collection(firestore, 'villas') : null, [firestore]);
    const stakeholdersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stakeholders') : null, [firestore]);

    const { data: villas, isLoading: isLoadingVillas } = useCollection<Villa>(villasQuery);
    const { data: stakeholders, isLoading: isLoadingStakeholders } = useCollection<Stakeholder>(stakeholdersQuery);

    const stakeholderMap = useMemoFirebase(() => {
        if (!stakeholders) return new Map();
        return new Map(stakeholders.map(s => [s.id, s.name]));
    }, [stakeholders]);

    const villasWithOwners = useMemoFirebase(() => {
        return villas?.map(v => ({
            ...v,
            ownerName: stakeholderMap.get(v.ownerId) || 'نامشخص'
        })) ?? [];
    }, [villas, stakeholderMap]);

    const form = useForm<VillaFormData>({
        resolver: zodResolver(villaSchema),
        defaultValues: { villaNumber: '', location: '', size: 0, ownerId: '' },
    });

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
        <>
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>نقشه تعاملی شهرک</CardTitle>
                        <CardDescription>نمای کلی ویلاها و مدیریت آنها</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        افزودن ویلا
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full overflow-auto rounded-lg border bg-gray-100 dark:bg-gray-800 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {isLoadingVillas && <p>در حال بارگذاری ویلاها...</p>}
                            {villasWithOwners?.map(villa => (
                                <div key={villa.id} className="group relative">
                                    <Card className="flex flex-col items-center justify-center p-4 aspect-square transition-all hover:shadow-lg hover:scale-105">
                                        <Home className="w-8 h-8 text-primary mb-2" />
                                        <Badge variant="secondary" className="mb-1">{villa.villaNumber}</Badge>
                                        <p className="text-xs text-center text-muted-foreground truncate">{villa.ownerName}</p>
                                    </Card>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                        <Button variant="outline" size="icon" className="text-white border-white hover:bg-white/20" onClick={() => handleEdit(villa)}>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
            
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
                            <FormField control={form.control} name="villaNumber" render={({ field }) => (
                                <FormItem><FormLabel>شماره ویلا</FormLabel><FormControl><Input placeholder="مثال: A101" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>موقعیت</FormLabel><FormControl><Input placeholder="مثال: فاز ۱، خیابان یاس" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="size" render={({ field }) => (
                                <FormItem><FormLabel>متراژ (متر مربع)</FormLabel><FormControl><Input type="number" placeholder="مثال: 300" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField
                                control={form.control}
                                name="ownerId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>مالک</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <DialogClose asChild><Button type="button" variant="outline">انصراف</Button></DialogClose>
                                <Button type="submit">ذخیره</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
