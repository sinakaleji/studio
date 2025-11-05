
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { Villa, VillaOccupancyStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface AddVillaProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Villa, 'id' | 'mapPosition'> & { id?: string }) => void;
  villa: Villa | null;
}

const statusOptions: { value: VillaOccupancyStatus, label: string }[] = [
    { value: 'owner-occupied', label: 'مالک ساکن' },
    { value: 'rented', label: 'اجاره' },
    { value: 'vacant', label: 'خالی' },
];

export default function AddVilla({ isOpen, onOpenChange, onSave, villa }: AddVillaProps) {
  const [villaNumber, setVillaNumber] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [contact, setContact] = useState("");
  const [occupancyStatus, setOccupancyStatus] = useState<VillaOccupancyStatus>('vacant');
  const [isForSale, setIsForSale] = useState(false);
  const [tenantFirstName, setTenantFirstName] = useState("");
  const [tenantLastName, setTenantLastName] = useState("");
  const [tenantContact, setTenantContact] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [hasParking, setHasParking] = useState(false);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (villa) {
      setVillaNumber(villa.villaNumber.toString());
      setOwnerFirstName(villa.ownerFirstName || "");
      setOwnerLastName(villa.ownerLastName || "");
      setContact(villa.contact || "");
      setOccupancyStatus(villa.occupancyStatus || 'vacant');
      setIsForSale(villa.isForSale || false);
      setTenantFirstName(villa.tenant?.firstName || "");
      setTenantLastName(villa.tenant?.lastName || "");
      setTenantContact(villa.tenant?.contact || "");
      setBedrooms(villa.bedrooms?.toString() || "");
      setArea(villa.area?.toString() || "");
      setHasParking(villa.hasParking || false);
      setDescription(villa.description || "");
    } else {
      // Reset form for new entry
      setVillaNumber("");
      setOwnerFirstName("");
      setOwnerLastName("");
      setContact("");
      setOccupancyStatus('vacant');
      setIsForSale(false);
      setTenantFirstName("");
      setTenantLastName("");
      setTenantContact("");
      setBedrooms("");
      setArea("");
      setHasParking(false);
      setDescription("");
    }
  }, [villa, isOpen]);

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = () => {
    if (!villaNumber) {
      toast({ variant: "destructive", title: "خطا", description: "لطفا شماره ویلا را وارد کنید." });
      return;
    }
    if (!ownerFirstName || !ownerLastName) {
      toast({ variant: "destructive", title: "خطا", description: "لطفا نام و نام خانوادگی مالک را وارد کنید." });
      return;
    }
    if (!validatePhoneNumber(contact)) {
      toast({ variant: "destructive", title: "خطا", description: "شماره تماس مالک معتبر نیست. (مثال: 09123456789)" });
      return;
    }
    if (occupancyStatus === 'rented' && (!tenantFirstName || !tenantLastName)) {
        toast({ variant: "destructive", title: "خطا", description: "لطفا نام و نام خانوادگی مستاجر را وارد کنید." });
        return;
    }
    if (occupancyStatus === 'rented' && !validatePhoneNumber(tenantContact)) {
        toast({ variant: "destructive", title: "خطا", description: "شماره تماس مستاجر معتبر نیست. (مثال: 09123456789)" });
        return;
    }

    onSave({
      id: villa?.id,
      villaNumber: parseInt(villaNumber, 10),
      ownerFirstName,
      ownerLastName,
      contact,
      occupancyStatus,
      isForSale,
      tenant: occupancyStatus === 'rented' ? {
        firstName: tenantFirstName,
        lastName: tenantLastName,
        contact: tenantContact
      } : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      area: area ? parseFloat(area) : undefined,
      hasParking,
      description,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{villa ? "ویرایش ویلا" : "افزودن ویلا جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات ویلا و ساکنین آن را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          {/* Main Info */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="villaNumber" className="text-right">
              شماره ویلا
            </Label>
            <Input id="villaNumber" type="number" value={villaNumber} onChange={e => setVillaNumber(e.target.value)} className="col-span-3" />
          </div>
          {/* Owner Info */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ownerFirstName" className="text-right">
              نام مالک
            </Label>
            <Input id="ownerFirstName" value={ownerFirstName} onChange={e => setOwnerFirstName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ownerLastName" className="text-right">
              نام خانوادگی مالک
            </Label>
            <Input id="ownerLastName" value={ownerLastName} onChange={e => setOwnerLastName(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              تماس مالک
            </Label>
            <Input id="contact" value={contact} onChange={e => setContact(e.target.value)} className="col-span-3" placeholder="مثال: 09123456789" />
          </div>

          {/* Villa Details */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bedrooms" className="text-right">
              تعداد خواب
            </Label>
            <Input id="bedrooms" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="area" className="text-right">
              متراژ (متر مربع)
            </Label>
            <Input id="area" type="number" value={area} onChange={e => setArea(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="hasParking" className="text-right">
                پارکینگ
            </Label>
            <div className="col-span-3 flex items-center gap-2">
                <Checkbox id="hasParking" checked={hasParking} onCheckedChange={(checked) => setHasParking(Boolean(checked))} />
                <label htmlFor="hasParking" className="text-sm cursor-pointer">دارد</label>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
             <Label htmlFor="description" className="text-right">
                توضیحات
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="توضیحات اضافی درباره ویلا..."/>
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="occupancyStatus" className="text-right">
              وضعیت سکونت
            </Label>
            <Select value={occupancyStatus} onValueChange={(value: VillaOccupancyStatus) => setOccupancyStatus(value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="وضعیت را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isForSale" className="text-right">
                وضعیت فروش
            </Label>
            <div className="col-span-3 flex items-center gap-2">
                <Checkbox id="isForSale" checked={isForSale} onCheckedChange={(checked) => setIsForSale(Boolean(checked))} />
                <label htmlFor="isForSale" className="text-sm cursor-pointer">برای فروش</label>
            </div>
          </div>

          {/* Tenant Info */}
          {occupancyStatus === 'rented' && (
             <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right col-span-4 pb-2 font-semibold">اطلاعات مستاجر</Label>
                  <Label htmlFor="tenantFirstName" className="text-right">
                    نام
                  </Label>
                  <Input id="tenantFirstName" value={tenantFirstName} onChange={e => setTenantFirstName(e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenantLastName" className="text-right">
                    نام خانوادگی
                  </Label>
                  <Input id="tenantLastName" value={tenantLastName} onChange={e => setTenantLastName(e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenantContact" className="text-right">
                    شماره تماس
                  </Label>
                  <Input id="tenantContact" value={tenantContact} onChange={e => setTenantContact(e.target.value)} className="col-span-3" placeholder="مثال: 09123456789"/>
                </div>
              </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>ذخیره</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
