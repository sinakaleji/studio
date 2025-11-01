'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, File, Trash2, Download, Loader2 } from 'lucide-react';
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
import { useCollection, useFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, Timestamp, query, orderBy, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


const documentSchema = z.object({
  fileName: z.string().min(1, 'نام فایل الزامی است'),
  file: z.instanceof(FileList).refine(files => files?.length > 0, 'فایل الزامی است'),
  relatedEntityType: z.enum(['general', 'villa', 'personnel', 'stakeholder'], { required_error: 'انتخاب نوع ارتباط الزامی است'}),
  relatedEntityId: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

type Villa = { id: string, villaNumber: string };
type Personnel = { id: string, firstName: string, lastName: string };
type Stakeholder = { id: string, name: string };
type Document = {
    id: string;
    fileName: string;
    fileType: string;
    uploadDate: Timestamp;
    fileUrl: string;
    storagePath: string;
    relatedEntityType?: 'general' | 'villa' | 'personnel' | 'stakeholder';
    relatedEntityId?: string;
    relatedEntityName?: string;
};

export default function DocumentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const storage = getStorage();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      fileName: '',
      relatedEntityType: 'general',
      relatedEntityId: '',
    },
  });
  const selectedEntityType = form.watch('relatedEntityType');


  const documentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'documents'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const villasQuery = useMemoFirebase(() => firestore ? collection(firestore, 'villas') : null, [firestore]);
  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, [firestore]);
  const stakeholdersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stakeholders') : null, [firestore]);

  const { data: documents, isLoading } = useCollection<Document>(documentsQuery);
  const { data: villas } = useCollection<Villa>(villasQuery);
  const { data: personnel } = useCollection<Personnel>(personnelQuery);
  const { data: stakeholders } = useCollection<Stakeholder>(stakeholdersQuery);

  const getEntityName = (type?: string, id?: string) => {
    if (!type || !id || type === 'general') return 'عمومی';
    switch (type) {
      case 'villa':
        return villas?.find(v => v.id === id)?.villaNumber || id;
      case 'personnel':
        const p = personnel?.find(p => p.id === id);
        return p ? `${p.firstName} ${p.lastName}` : id;
      case 'stakeholder':
        return stakeholders?.find(s => s.id === id)?.name || id;
      default:
        return 'نامشخص';
    }
  }

  const onSubmit = async (data: DocumentFormData) => {
    if (!firestore) return;
    if (data.relatedEntityType !== 'general' && !data.relatedEntityId) {
        toast({ variant: 'destructive', title: 'خطا', description: 'لطفا آیتم مرتبط را انتخاب کنید.' });
        return;
    }
    
    setIsUploading(true);
    const file = data.file[0];
    const storagePath = `documents/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const documentData = {
        fileName: data.fileName,
        fileType: file.type,
        fileUrl: downloadURL,
        storagePath: storagePath,
        uploadDate: serverTimestamp(),
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        relatedEntityName: getEntityName(data.relatedEntityType, data.relatedEntityId),
      };

      await addDoc(collection(firestore, 'documents'), documentData);

      toast({
        title: 'موفقیت‌آمیز',
        description: 'مدرک با موفقیت آپلود شد.',
      });

      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'مشکلی در آپلود فایل به وجود آمد.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (docToDelete: Document) => {
      if (!firestore) return;
      
      const fileRef = ref(storage, docToDelete.storagePath);
  
      try {
        await deleteObject(fileRef);
        deleteDocumentNonBlocking(doc(firestore, 'documents', docToDelete.id));
        
        toast({
          title: 'موفقیت آمیز',
          description: `مدرک "${docToDelete.fileName}" با موفقیت حذف شد.`,
        });
      } catch (error) {
        console.error("Error deleting document: ", error);
        toast({
          variant: 'destructive',
          title: 'خطا',
          description: 'مشکلی در حذف مدرک به وجود آمد.',
        });
      }
    };

  return (
    <AppLayout>
      <Header title="مدیریت مدارک" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>آرشیو مدارک</CardTitle>
                    <CardDescription>بارگذاری، مشاهده و مدیریت مدارک مرتبط با شهرک</CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    بارگذاری مدرک
                </Button>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                <p>در حال بارگذاری مدارک...</p>
               ) : !documents || documents.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">هنوز هیچ مدرکی بارگذاری نشده است.</p>
                </div>
               ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام مدرک</TableHead>
                            <TableHead>مربوط به</TableHead>
                            <TableHead>تاریخ بارگذاری</TableHead>
                            <TableHead>عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents?.map((docItem) => (
                            <TableRow key={docItem.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    {docItem.fileName}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={docItem.relatedEntityType === 'general' ? 'secondary' : 'default'}>
                                        {docItem.relatedEntityName || 'عمومی'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {docItem.uploadDate ? new Date(docItem.uploadDate.seconds * 1000).toLocaleDateString('fa-IR') : '...'}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <a href={docItem.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>
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
                                            این عمل غیرقابل بازگشت است. مدرک "{docItem.fileName}" برای همیشه حذف خواهد شد.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(docItem)}>حذف</AlertDialogAction>
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
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) form.reset();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>بارگذاری مدرک جدید</DialogTitle>
            <DialogDescription>فایل مدرک و اطلاعات مربوط به آن را مشخص کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام مدرک</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: سند مالکیت ویلای A101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="relatedEntityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مربوط به</FormLabel>
                      <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('relatedEntityId', '');
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب کنید که مدرک مربوط به چیست" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">عمومی</SelectItem>
                          <SelectItem value="villa">ویلا</SelectItem>
                          <SelectItem value="personnel">پرسنل</SelectItem>
                          <SelectItem value="stakeholder">ذی‌نفع / هیئت مدیره</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedEntityType === 'villa' && (
                  <FormField control={form.control} name="relatedEntityId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>انتخاب ویلا</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="یک ویلا را انتخاب کنید" /></SelectTrigger></FormControl>
                        <SelectContent>{villas?.map(v => <SelectItem key={v.id} value={v.id}>{v.villaNumber}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}
                {selectedEntityType === 'personnel' && (
                   <FormField control={form.control} name="relatedEntityId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>انتخاب پرسنل</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="یک شخص را انتخاب کنید" /></SelectTrigger></FormControl>
                        <SelectContent>{personnel?.map(p => <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}
                {selectedEntityType === 'stakeholder' && (
                    <FormField control={form.control} name="relatedEntityId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>انتخاب ذی‌نفع</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="یک ذی‌نفع را انتخاب کنید" /></SelectTrigger></FormControl>
                        <SelectContent>{stakeholders?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}

              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>انتخاب فایل</FormLabel>
                    <FormControl>
                        <Input type="file" {...rest} onChange={(e) => { onChange(e.target.files) }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isUploading}>
                    انصراف
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? <><Loader2 className="ml-2 h-4 w-4 animate-spin"/> در حال بارگذاری...</> : <><Upload className="ml-2 h-4 w-4" /> ذخیره</>}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
