
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { getPersonnel, savePersonnel } from "@/lib/data-manager";
import type { Personnel } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddPersonnel from "./_components/add-personnel";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setPersonnel(getPersonnel());
  }, []);

  const handleSave = (personnelData: Omit<Personnel, 'id'> & { id?: string }) => {
    let updatedPersonnel;
    if (personnelData.id) {
      updatedPersonnel = personnel.map((p) =>
        p.id === personnelData.id ? { ...p, ...personnelData } : p
      );
    } else {
      const newPersonnel: Personnel = {
        ...personnelData,
        id: `p${Date.now()}`,
      };
      updatedPersonnel = [...personnel, newPersonnel];
    }
    savePersonnel(updatedPersonnel);
    setPersonnel(updatedPersonnel);
    setEditingPersonnel(null);
    setIsAddPersonnelOpen(false);
  };

  const handleDelete = (personnelId: string) => {
    const updatedPersonnel = personnel.filter((p) => p.id !== personnelId);
    savePersonnel(updatedPersonnel);
    setPersonnel(updatedPersonnel);
  };

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    setIsAddPersonnelOpen(true);
  };

  const handleAddNew = () => {
    setEditingPersonnel(null);
    setIsAddPersonnelOpen(true);
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <AddPersonnel
        isOpen={isAddPersonnelOpen}
        onOpenChange={setIsAddPersonnelOpen}
        onSave={handleSave}
        personnel={editingPersonnel}
      />
      <PageHeader title="مدیریت پرسنل">
        <Button onClick={handleAddNew}>افزودن پرسنل</Button>
      </PageHeader>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام و نام خانوادگی</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>شماره تماس</TableHead>
              <TableHead>مدارک</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personnel.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{`${person.firstName} ${person.lastName}`}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{person.role}</Badge>
                </TableCell>
                <TableCell>{person.contact}</TableCell>
                 <TableCell>
                  {person.documentUrl ? (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={person.documentUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                   <Button variant="outline" size="icon" onClick={() => handleEdit(person)}>
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
                        <AlertDialogTitle>آیا از حذف مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          این عمل قابل بازگشت نیست. این شخص برای همیشه حذف خواهد شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(person.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
