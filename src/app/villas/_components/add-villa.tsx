
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
import type { Villa, VillaStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AddVillaProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Villa, 'id' | 'mapPosition'> & { id?: string }) => void;
  villa: Villa | null;
}

const statusOptions: { value: VillaStatus, label: string }[] = [
    { value: 'owner-occupied', label: 'مالک ساکن' },
    { value: 'rented', label: 'اجاره' },
    { value: 'vacant', label: 'خالی' },
    { value: 'for-sale', label: 'برای فروش' },
];

export default function AddVilla({ isOpen, onOpenChange, onSave, villa }: AddVillaProps) {
  const [villaNumber, setVillaNumber] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<VillaStatus>('vacant');
  const [tenantFirstName, setTenantFirstName] = useState("");
  const [tenantLastName, setTenantLastName] = useState("");
  const [tenantContact, setTenantContact] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (villa) {
      setVillaNumber(villa.villaNumber.toString());
      setOwnerFirstName(villa.ownerFirstName || "");
      setOwnerLastName(villa.ownerLastName || "");
      setContact(villa.contact || "");
      setStatus(villa.status || 'vacant');
      setTenantFirstName(villa.tenantFirstName || "");
      setTenantLastName(villa.tenantLastName || "");
      setTenantContact(villa.tenantContact || "");
    } else {
      // Reset form for new entry
      setVillaNumber("");
      setOwnerFirstName("");
      setOwnerLastName("");
      setContact("");
      setStatus('vacant');
      setTenantFirstName("");
      setTenantLastName("");
      setTenantContact("");
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
    if (status === 'rented') {
      if (!tenantFirstName || !tenantLastName) {
        toast({ variant: "destructive", title: "خطا", description: "لطفا نام و نام خانوادگی مستاجر را وارد کنید." });
        return;
      }
      if (!validatePhoneNumber(tenantContact)) {
        toast({ variant: "destructive", title: "خطا", description: "شماره تماس مستاجر معتبر نیست. (مثال: 09123456789)" });
        return;
      }
    }

    onSave({
      id: villa?.id,
      villaNumber: parseInt(villaNumber, 10),
      ownerFirstName,
      ownerLastName,
      contact,
      status,
      tenantFirstName: status === 'rented' ? tenantFirstName : "",
      tenantLastName: status === 'rented' ? tenantLastName : "",
      tenantContact: status === 'rented' ? tenantContact : "",
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
            <Label htmlFor="status" className="text-right">
              وضعیت ویلا
            </Label>
            <Select value={status} onValueChange={(value: VillaStatus) => setStatus(value)}>
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
          {status === 'rented' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t">
                <Label htmlFor="tenantFirstName" className="text-right">
                  نام مستاجر
                </Label>
                <Input id="tenantFirstName" value={tenantFirstName} onChange={e => setTenantFirstName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantLastName" className="text-right">
                  نام خانوادگی مستاجر
                </Label>
                <Input id="tenantLastName" value={tenantLastName} onChange={e => setTenantLastName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenantContact" className="text-right">
                  تماس مستاجر
                </Label>
                <Input id="tenantContact" value={tenantContact} onChange={e => setTenantContact(e.target.value)} className="col-span-3" placeholder="مثال: 09123456789" />
              </div>
            </>
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
