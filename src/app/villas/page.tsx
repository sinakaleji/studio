
"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/page-header";
import { getVillas, saveVillas, getBuildings, saveBuildings, getMapImageUrl, saveMapImageUrl } from "@/lib/data-manager";
import type { Villa, Building, VillaOccupancyStatus } from "@/lib/types";
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
import AddBuilding from "./_components/add-building";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Upload, Map, Check, X, BuildingIcon, Tag } from "lucide-react";
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

type MapItem = (Villa & { itemType: 'villa' }) | (Building & { itemType: 'building' });

const occupancyStatusMap: { [key in VillaOccupancyStatus]: { text: string; className: string } } = {
  'owner-occupied': { text: 'مالک ساکن', className: 'bg-blue-100 text-blue-800' },
  'rented': { text: 'اجاره', className: 'bg-yellow-100 text-yellow-800' },
  'vacant': { text: 'خالی', className: 'bg-gray-100 text-gray-800' },
};


export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [isAddVillaOpen, setIsAddVillaOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempMapItems, setTempMapItems] = useState<MapItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setVillas(getVillas());
    setBuildings(getBuildings());
    setMapImageUrl(getMapImageUrl());
  }, []);

  const handleSaveVilla = (villaData: Omit<Villa, 'id' | 'mapPosition'> & { id?: string }) => {
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
  
  const handleDeleteVilla = (villaId: string) => {
    const updatedVillas = villas.filter((v) => v.id !== villaId);
    saveVillas(updatedVillas);
    setVillas(updatedVillas);
  };

  const handleEditVilla = (villa: Villa) => {
    setEditingVilla(villa);
    setIsAddVillaOpen(true);
  };

  const handleAddNewVilla = () => {
    setEditingVilla(null);
    setIsAddVillaOpen(true);
  }

  const handleSaveBuilding = (buildingData: Omit<Building, 'id' | 'mapPosition'> & { id?: string }) => {
    let updatedBuildings;
    if (buildingData.id) {
      updatedBuildings = buildings.map((b) =>
        b.id === buildingData.id ? { ...b, ...buildingData } : b
      );
    } else {
      const newBuilding: Building = {
        ...buildingData,
        id: `bldg${Date.now()}`,
        mapPosition: { top: '50%', left: '50%' },
      };
      updatedBuildings = [...buildings, newBuilding];
    }
    saveBuildings(updatedBuildings);
    setBuildings(updatedBuildings);
    setEditingBuilding(null);
    setIsAddBuildingOpen(false);
  };

  const handleDeleteBuilding = (buildingId: string) => {
    const updatedBuildings = buildings.filter((b) => b.id !== buildingId);
    saveBuildings(updatedBuildings);
    setBuildings(updatedBuildings);
  };
  
  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsAddBuildingOpen(true);
  };

  const handleAddNewBuilding = () => {
    setEditingBuilding(null);
    setIsAddBuildingOpen(true);
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

  const mapItems: MapItem[] = [
    ...villas.map(v => ({ ...v, itemType: 'villa' as const })),
    ...buildings.map(b => ({ ...b, itemType: 'building' as const })),
  ];
  
  const toggleEditMode = () => {
    if (!isEditMode) {
      setTempMapItems(mapItems);
    }
    setIsEditMode(!isEditMode);
  };

  const saveMapChanges = () => {
    const newVillas = tempMapItems.filter(item => item.itemType === 'villa').map(({ itemType, ...rest }) => rest as Villa);
    const newBuildings = tempMapItems.filter(item => item.itemType === 'building').map(({ itemType, ...rest }) => rest as Building);
    
    saveVillas(newVillas);
    setVillas(newVillas);
    
    saveBuildings(newBuildings);
    setBuildings(newBuildings);

    setIsEditMode(false);
    toast({ title: "موفق", description: "چیدمان نقشه ذخیره شد." });
  };

  const cancelMapChanges = () => {
    setIsEditMode(false);
    setTempMapItems([]);
  };
  
  const handleItemMove = (itemId: string, position: { top: string; left: string }) => {
    setTempMapItems(currentItems => 
        currentItems.map(item => 
            item.id === itemId ? { ...item, mapPosition: position } : item
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
        onSave={handleSaveVilla}
        villa={editingVilla}
      />
       <AddBuilding
        isOpen={isAddBuildingOpen}
        onOpenChange={setIsAddBuildingOpen}
        onSave={handleSaveBuilding}
        building={editingBuilding}
       />

      <PageHeader title="مدیریت ویلاها و ساختمان‌ها">
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
        <Button onClick={handleAddNewBuilding}>
          <BuildingIcon className="ml-2 h-4 w-4" />
          افزودن ساختمان
        </Button>
        <Button onClick={handleAddNewVilla}>افزودن ویلا</Button>
      </PageHeader>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div className="space-y-1.5">
                <CardTitle>نقشه شماتیک شهرک</CardTitle>
                {isEditMode && (
                    <CardDescription>حالت ویرایش فعال است. آیکون‌ها را برای جابجایی بکشید.</CardDescription>
                )}
            </div>
            <div className="flex gap-2 flex-wrap">
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
            items={isEditMode ? tempMapItems : mapItems} 
            mapImageUrl={mapImageUrl} 
            isEditMode={isEditMode}
            onItemMove={handleItemMove}
            onEditVilla={handleEditVilla}
            onEditBuilding={handleEditBuilding}
            />
        </CardContent>
      </Card>
      
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px] text-center">شماره ویلا</TableHead>
              <TableHead className="min-w-[150px] text-center">مالک</TableHead>
              <TableHead className="min-w-[120px] text-center">شماره تماس</TableHead>
              <TableHead className="text-center">وضعیت</TableHead>
              <TableHead className="min-w-[150px] text-center">نام مستاجر</TableHead>
              <TableHead className="min-w-[150px] text-center">نام خانوادگی مستاجر</TableHead>
              <TableHead className="min-w-[120px] text-center">تماس مستاجر</TableHead>
              <TableHead className="min-w-[120px] text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...villas].sort((a, b) => a.villaNumber - b.villaNumber).map((villa) => (
              <TableRow key={villa.id}>
                <TableCell className="font-medium text-center">{toPersianDigits(villa.villaNumber)}</TableCell>
                <TableCell className="text-center">{`${villa.ownerFirstName} ${villa.ownerLastName}`}</TableCell>
                <TableCell className="text-center">{toPersianDigits(villa.contact || "-")}</TableCell>
                <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Badge variant="outline" className={occupancyStatusMap[villa.occupancyStatus]?.className}>
                            {occupancyStatusMap[villa.occupancyStatus]?.text || villa.occupancyStatus}
                        </Badge>
                        {villa.isForSale && (
                             <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <Tag className="ml-1 h-3 w-3" />
                                برای فروش
                            </Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-center">{villa.tenant ? villa.tenant.firstName : "-"}</TableCell>
                <TableCell className="text-center">{villa.tenant ? villa.tenant.lastName : "-"}</TableCell>
                <TableCell className="text-center">{villa.tenant ? toPersianDigits(villa.tenant.contact) : "-"}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditVilla(villa)}>
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
                        <AlertDialogAction onClick={() => handleDeleteVilla(villa.id)}>
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

       <div className="border rounded-lg overflow-x-auto mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">نام ساختمان</TableHead>
              <TableHead className="text-center">نوع</TableHead>
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium text-center">{building.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{
                    {
                      'security': 'نگهبانی',
                      'facility': 'تاسیسات',
                      'office': 'اداری',
                      'other': 'سایر'
                    }[building.type]
                  }</Badge>
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditBuilding(building)}>
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
                           این عمل قابل بازگشت نیست. این ساختمان برای همیشه حذف خواهد شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBuilding(building.id)}>
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
