
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { getVillas, saveVillas } from "@/lib/data-manager";
import type { Villa } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toPersianDigits } from "@/lib/utils";
import SchematicMap from "./_components/schematic-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddVilla from "./_components/add-villa";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [isAddVillaOpen, setIsAddVillaOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setVillas(getVillas());
  }, []);

  const handleSave = (villaData: Omit<Villa, 'id' | 'mapPosition'> & { id?: string }) => {
    let updatedVillas;
    if (villaData.id) {
      // Edit existing
      const existingVilla = villas.find(v => v.id === villaData.id);
      updatedVillas = villas.map((v) =>
        v.id === villaData.id ? { ...v, ...villaData } : v
      );
    } else {
      // Add new
      const newVilla: Villa = {
        ...villaData,
        id: `v${Date.now()}`,
        // Position new villas off-map initially
        mapPosition: { top: '0%', left: '0%' }, 
      };
      updatedVillas = [...villas, newVilla];
    }
    saveVillas(updatedVillas);
    setVillas(updatedVillas);
    setEditingVilla(null);
    setIsAddVillaOpen(false);
  };
  
  const handleDelete = (villaId: string) => {
    const updatedVillas = villas.filter((v) => v.id !== villaId);
    saveVillas(updatedVillas);
    setVillas(updatedVillas);
  };

  const handleEdit = (villa: Villa) => {
    setEditingVilla(villa);
    setIsAddVillaOpen(true);
  };

  const handleAddNew = () => {
    setEditingVilla(null);
    setIsAddVillaOpen(true);
  }

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <AddVilla
        isOpen={isAddVillaOpen}
        onOpenChange={setIsAddVillaOpen}
        onSave={handleSave}
        villa={editingVilla}
      />
      <PageHeader title="مدیریت ویلاها و ساکنین">
        <Button onClick={handleAddNew}>افزودن ویلا</Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>نقشه شماتیک شهرک</CardTitle>
        </CardHeader>
        <CardContent>
          <SchematicMap villas={villas} />
        </CardContent>
      </Card>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره ویلا</TableHead>
              <TableHead>مالک</TableHead>
              <TableHead>شماره تماس</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>مستاجر</TableHead>
              <TableHead>تماس مستاجر</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {villas.map((villa) => (
              <TableRow key={villa.id}>
                <TableCell className="font-medium">{toPersianDigits(villa.villaNumber)}</TableCell>
                <TableCell>{villa.ownerName}</TableCell>
                <TableCell>{villa.contact || "-"}</TableCell>
                <TableCell>
                  {villa.isRented ? (
                    <Badge variant="destructive">اجاره</Badge>
                  ) : (
                    <Badge variant="secondary">مالک ساکن</Badge>
                  )}
                </TableCell>
                <TableCell>{villa.tenantName || "-"}</TableCell>
                <TableCell>{villa.tenantContact || "-"}</TableCell>
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
                        <AlertDialogTitle>آیا از حذف مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          این عمل قابل بازگشت نیست. این ویلا برای همیشه حذف خواهد شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(villa.id)}>
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
