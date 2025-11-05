
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toPersianDigits } from "@/lib/utils";


const generateNextPersonnelNumber = (allPersonnel: Personnel[]): string => {
    if (!allPersonnel.length) {
        return "001";
    }
    const maxNumber = allPersonnel.reduce((max, p) => {
        const num = parseInt(p.personnelNumber, 10);
        return num > max ? num : max;
    }, 0);
    return (maxNumber + 1).toString().padStart(3, '0');
};


export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setPersonnel(getPersonnel());
  }, []);

  const nextPersonnelNumber = useMemo(() => generateNextPersonnelNumber(personnel), [personnel]);


  const handleSave = (personnelData: Omit<Personnel, 'id' | 'personnelNumber'> & { id?: string; personnelNumber?: string }) => {
    let updatedPersonnel;
    if (personnelData.id) {
      updatedPersonnel = personnel.map((p) =>
        p.id === personnelData.id ? { ...p, ...personnelData, personnelNumber: p.personnelNumber } : p
      );
    } else {
      const newPersonnel: Personnel = {
        ...personnelData,
        id: `p${Date.now()}`,
        personnelNumber: personnelData.personnelNumber || generateNextPersonnelNumber(personnel),
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
        nextPersonnelNumber={nextPersonnelNumber}
      />
      <PageHeader title="مدیریت پرسنل">
        <Button onClick={handleAddNew}>افزودن پرسنل</Button>
      </PageHeader>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره پرسنلی</TableHead>
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
                <TableCell className="font-medium">{toPersianDigits(person.personnelNumber)}</TableCell>
                <TableCell className="font-medium">{`${person.firstName} ${person.lastName}`}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{person.role}</Badge>
                </TableCell>
                <TableCell>{person.contact}</TableCell>
                 <TableCell>
                  {person.documents && person.documents.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          مشاهده مدارک ({person.documents.length})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {person.documents.map((doc, index) => (
                          <DropdownMenuItem key={index} asChild>
                             <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                                <FileText className="h-4 w-4" />
                                {doc.name || `مدرک ${index + 1}`}
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
