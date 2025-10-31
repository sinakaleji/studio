'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, File, Trash2, Download } from 'lucide-react';
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
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const documentSchema = z.object({
  fileName: z.string().min(1, 'نام فایل الزامی است'),
  file: z.instanceof(FileList).refine(files => files?.length > 0, 'فایل الزامی است'),
});

type DocumentFormData = z.infer<typeof documentSchema>;
type Document = {
    id: string;
    fileName: string;
    fileType: string;
    uploadDate: any;
    fileUrl: string;
    storagePath: string;
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
    },
  });

  const documentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'documents');
  }, [firestore]);

  const { data: documents, isLoading } = useCollection<Document>(documentsQuery);

  const onSubmit = async (data: DocumentFormData) => {
    if (!firestore) return;
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
      };

      addDocumentNonBlocking(collection(firestore, 'documents'), documentData);

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
      
      // Create a reference to the file to delete
      const fileRef = ref(storage, docToDelete.storagePath);
  
      try {
        // Delete the file from Storage
        await deleteObject(fileRef);
  
        // Delete the document from Firestore
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
                    <CardDescription>بارگذاری، مشاهده و مدیریت مدارک</CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    بارگذاری مدرک
                </Button>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                <p>در حال بارگذاری مدارک...</p>
               ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>نام مدرک</TableHead>
                            <TableHead>نوع فایل</TableHead>
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
                                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                                        {docItem.fileType}
                                    </span>
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>بارگذاری مدرک جدید</DialogTitle>
            <DialogDescription>فایل مدرک را انتخاب کرده و یک نام برای آن تعیین کنید.</DialogDescription>
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
                  {isUploading ? <><Loader className="ml-2 h-4 w-4 animate-spin"/> در حال بارگذاری...</> : <><Upload className="ml-2 h-4 w-4" /> ذخیره</>}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
