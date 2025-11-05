
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
  const [tenantInfo, setTenantInfo] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (villa) {
      setVillaNumber(villa.villaNumber.toString());
      setOwnerFirstName(villa.ownerFirstName || "");
      setOwnerLastName(villa.ownerLastName || "");
      setContact(villa.contact || "");
      setOccupancyStatus(villa.occupancyStatus || 'vacant');
      setIsForSale(villa.isForSale || false);
      setTenantInfo(villa.tenantInfo || "");
    } else {
      // Reset form for new entry
      setVillaNumber("");
      setOwnerFirstName("");
      setOwnerLastName("");
      setContact("");
      setOccupancyStatus('vacant');
      setIsForSale(false);
      setTenantInfo("");
    }
  }, [villa, isOpen]); // Rerun effect when dialog opens or villa data changes

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
    if (occupancyStatus === 'rented' && !tenantInfo) {
        toast({ variant: "destructive", title: "خطا", description: "لطفا اطلاعات مستاجر را وارد کنید." });
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
      tenantInfo: occupancyStatus === 'rented' ? tenantInfo : "",
    });
    onOpenChange(false); // Close dialog on save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{villa ? "ویرایش ویلا" : "افزودن ویلا جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات ویلا و ساکنین آن را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="villaNumber" className="text-right">
              شماره ویلا
            </Label>
            <Input id="villaNumber" type="number" value={villaNumber} onChange={e => setVillaNumber(e.target.value)} className="col-span-3" />
          </div>
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
          {occupancyStatus === 'rented' && (
             <div className="grid grid-cols-4 items-start gap-4 pt-4 border-t">
                <Label htmlFor="tenantInfo" className="text-right pt-2">
                  اطلاعات مستاجر
                </Label>
                 <Textarea 
                    id="tenantInfo"
                    value={tenantInfo}
                    onChange={(e) => setTenantInfo(e.target.value)}
                    className="col-span-3"
                    placeholder="نام، نام خانوادگی و شماره تماس مستاجر..."
                 />
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
