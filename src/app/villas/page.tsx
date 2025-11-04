
"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/page-header";
import { getVillas, saveVillas, getMapImageUrl, saveMapImageUrl } from "@/lib/data-manager";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddVilla from "./_components/add-villa";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Upload, Map, Check, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [isAddVillaOpen, setIsAddVillaOpen] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempVillas, setTempVillas] = useState<Villa[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setVillas(getVillas());
    setMapImageUrl(getMapImageUrl());
  }, []);

  const handleSave = (villaData: Omit<Villa, 'id' | 'mapPosition'> & { id?: string }) => {
    let updatedVillas;
    if (villaData.id) {
      // Edit existing
      updatedVillas = villas.map((v) =>
        v.id === villaData.id ? { ...v, ...villaData } : v
      );
    } else {
      // Add new
      const newVilla: Villa = {
        ...villaData,
        id: `v${Date.now()}`,
        // Position new villas in a default spot
        mapPosition: { top: '50%', left: '50%' }, 
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

  const handleMapUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newUrl = e.target?.result as string;
          saveMapImageUrl(newUrl);
          setMapImageUrl(newUrl);
          toast({
            title: "موفق",
            description: "نقشه با موفقیت بارگذاری شد.",
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          variant: "destructive",
          title: "خطا",
          description: "لطفا یک فایل تصویری معتبر انتخاب کنید.",
        });
      }
    }
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      // Entering edit mode, save current state
      setTempVillas(villas);
    }
    setIsEditMode(!isEditMode);
  };

  const saveMapChanges = () => {
    saveVillas(tempVillas);
    setVillas(tempVillas);
    setIsEditMode(false);
    toast({ title: "موفق", description: "چیدمان نقشه ذخیره شد." });
  };

  const cancelMapChanges = () => {
    // Revert to original positions
    setTempVillas(villas);
    setIsEditMode(false);
  };
  
  const handleVillaMove = (villaId: string, position: { top: string; left: string }) => {
    setTempVillas(currentVillas => 
        currentVillas.map(v => 
            v.id === villaId ? { ...v, mapPosition: position } : v
        )
    );
  };

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
         <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <Button onClick={handleMapUploadClick} variant="outline">
            <Upload className="ml-2 h-4 w-4" />
            آپلود نقشه
        </Button>
        <Button onClick={handleAddNew}>افزودن ویلا</Button>
      </PageHeader>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div className="space-y-1.5">
                <CardTitle>نقشه شماتیک شهرک</CardTitle>
                {isEditMode && (
                    <CardDescription>حالت ویرایش فعال است. آیکون‌ها را برای جابجایی بکشید.</CardDescription>
                )}
            </div>
            <div className="flex gap-2">
                {isEditMode ? (
                    <>
                        <Button onClick={saveMapChanges} size="sm">
                            <Check className="ml-2 h-4 w-4" />
                            ذخیره چیدمان
                        </Button>
                        <Button onClick={cancelMapChanges} variant="outline" size="sm">
                             <X className="ml-2 h-4 w-4" />
                            انصراف
                        </Button>
                    </>
                ) : (
                    <Button onClick={toggleEditMode} variant="outline" size="sm">
                        <Map className="ml-2 h-4 w-4" />
                        ویرایش چیدمان نقشه
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <SchematicMap 
            villas={isEditMode ? tempVillas : villas} 
            mapImageUrl={mapImageUrl} 
            isEditMode={isEditMode}
            onVillaMove={handleVillaMove}
            onEditVilla={handleEdit}
            />
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
            {[...villas].sort((a, b) => a.villaNumber - b.villaNumber).map((villa) => (
              <TableRow key={villa.id}>
                <TableCell className="font-medium">{toPersianDigits(villa.villaNumber)}</TableCell>
                <TableCell>{`${villa.ownerFirstName} ${villa.ownerLastName}`}</TableCell>
                <TableCell>{villa.contact || "-"}</TableCell>
                <TableCell>
                  {villa.isRented ? (
                    <Badge variant="destructive">اجاره</Badge>
                  ) : (
                    <Badge variant="secondary">مالک ساکن</Badge>
                  )}
                </TableCell>
                <TableCell>{villa.tenantFirstName ? `${villa.tenantFirstName} ${villa.tenantLastName}` : "-"}</TableCell>
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
